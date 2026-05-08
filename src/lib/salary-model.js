// Variable-salary model — port of variable-salary-calculator-export/salary-model.ts.
// See INTEGRATION.md in that export for the full derivation; in short:
//
//   totalHours    = maxHours − internalHours + extraHours − vacationDays × 8
//   revenue       = expectedRate × totalHours
//   profit        = revenue − fixedSalary × salaryCostFactor
//   variableGross = max(0, profit) × variablePercentage
//   variableNet   = variableGross / socialFeesDivisor
//   total         = fixedSalary + variableNet
//
// The semester supplement on variable pay (procentregeln, 12 % of the year's
// variable gross) is added as a lump sum on April.

const DEFAULT_SALARY_COST_FACTOR = 1.466;
const DEFAULT_SOCIAL_FEES_DIVISOR = 1.3142;
const DEFAULT_VARIABLE_PERCENTAGE = 10;
const DEFAULT_VACATION_DAYS = [0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 5];
const SEMESTER_SUPPLEMENT_MONTH_INDEX = 3; // April
const SEMESTER_SUPPLEMENT_PERCENT = 0.12;

const WORKING_HOURS_BY_YEAR = {
  2024: [176, 168, 168, 168, 168, 160, 184, 176, 168, 184, 168, 160],
  2025: [176, 160, 168, 160, 160, 168, 184, 168, 176, 184, 160, 176],
  2026: [160, 160, 176, 160, 152, 168, 184, 168, 176, 176, 168, 176],
  2027: [168, 160, 184, 168, 152, 176, 176, 176, 176, 168, 168, 176],
};

function getWorkingHoursForYear(year) {
  return WORKING_HOURS_BY_YEAR[year] || WORKING_HOURS_BY_YEAR[2026];
}

const MONTH_LABELS_SV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Juni',
  'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec',
];

function safeAt(arr, idx) {
  return arr && typeof arr[idx] === 'number' ? arr[idx] : 0;
}

function computeVariableSalary(inputs) {
  const {
    fixedSalary,
    expectedRate,
    variablePercentage,
    maxHours,
    internalHours,
    extraHours,
    vacationDays,
  } = inputs;

  const salaryCostFactor = inputs.salaryCostFactor != null ? inputs.salaryCostFactor : DEFAULT_SALARY_COST_FACTOR;
  const socialFeesDivisor = inputs.socialFeesDivisor != null ? inputs.socialFeesDivisor : DEFAULT_SOCIAL_FEES_DIVISOR;
  const variablePct = variablePercentage / 100;

  const months = [];
  let totalVacationDays = 0;
  for (let i = 0; i < 12; i++) {
    const maxH = safeAt(maxHours, i);
    const intH = safeAt(internalHours, i);
    const extH = safeAt(extraHours, i);
    const vac = safeAt(vacationDays, i);
    totalVacationDays += vac;
    const totalHours = maxH - intH + extH - vac * 8;
    const revenue = expectedRate * totalHours;
    const profit = revenue - fixedSalary * salaryCostFactor;
    const variableGross = profit > 0 ? profit * variablePct : 0;
    const variableNet = variableGross > 0 ? variableGross / socialFeesDivisor : 0;
    months.push({
      maxHours: maxH,
      internalHours: intH,
      extraHours: extH,
      vacationDays: vac,
      totalHours,
      revenue,
      profit,
      variableGross,
      variableNet,
      semesterSupplementGross: 0,
      semesterSupplementNet: 0,
      total: fixedSalary + variableNet,
    });
  }

  const annualVariableGross = months.reduce((a, m) => a + m.variableGross, 0);
  const supplementGross = annualVariableGross * SEMESTER_SUPPLEMENT_PERCENT;
  const supplementNet = supplementGross / socialFeesDivisor;
  if (months[SEMESTER_SUPPLEMENT_MONTH_INDEX]) {
    const apr = months[SEMESTER_SUPPLEMENT_MONTH_INDEX];
    apr.semesterSupplementGross = supplementGross;
    apr.semesterSupplementNet = supplementNet;
    apr.total = fixedSalary + apr.variableNet + supplementNet;
  }

  const sum = (pick) => months.reduce((acc, m) => acc + pick(m), 0);

  const yearly = {
    totalHours: sum((m) => m.totalHours),
    totalVacationDays,
    revenue: sum((m) => m.revenue),
    profit: sum((m) => m.profit),
    variableGross: sum((m) => m.variableGross),
    variableNet: sum((m) => m.variableNet),
    semesterSupplementGross: supplementGross,
    semesterSupplementNet: supplementNet,
    total: sum((m) => m.total),
    averageMonthly: sum((m) => m.total) / 12,
    annualFixed: fixedSalary * 12,
  };

  return {
    months,
    yearly,
    inputs: {
      fixedSalary,
      expectedRate,
      variablePercentage,
      salaryCostFactor,
      socialFeesDivisor,
    },
  };
}

function computeExpectedFullSalary(params) {
  if (params.expectedRate == null || params.expectedRate <= 0) return null;
  return computeVariableSalary({
    fixedSalary: params.fixedSalary,
    expectedRate: params.expectedRate,
    variablePercentage: params.variablePercentage,
    maxHours: getWorkingHoursForYear(params.year),
    vacationDays: DEFAULT_VACATION_DAYS,
    salaryCostFactor: params.salaryCostFactor,
    socialFeesDivisor: params.socialFeesDivisor,
  });
}

module.exports = {
  DEFAULT_SALARY_COST_FACTOR,
  DEFAULT_SOCIAL_FEES_DIVISOR,
  DEFAULT_VARIABLE_PERCENTAGE,
  DEFAULT_VACATION_DAYS,
  SEMESTER_SUPPLEMENT_MONTH_INDEX,
  SEMESTER_SUPPLEMENT_PERCENT,
  WORKING_HOURS_BY_YEAR,
  MONTH_LABELS_SV,
  getWorkingHoursForYear,
  computeVariableSalary,
  computeExpectedFullSalary,
};
