import { create } from 'zustand';
import type { Employee, PerformanceEvaluation } from '../types';

interface PerformanceState {
  employees: Employee[];
  evaluations: PerformanceEvaluation[];
  setEmployees: (employees: Employee[]) => void;
  addEvaluation: (evaluation: PerformanceEvaluation) => void;
  getEmployeeEvaluations: (employeeId: string) => PerformanceEvaluation[];
  calculateScore: (employeeId: string) => {
    goalScore: number;
    competencyScore: number;
    feedbackScore: number;
    finalScore: number;
  };
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  employees: [],
  evaluations: [],
  
  setEmployees: (employees) => set({ employees }),
  
  addEvaluation: (evaluation) =>
    set((state) => ({
      evaluations: [...state.evaluations, evaluation],
    })),
  
  getEmployeeEvaluations: (employeeId) => {
    const { evaluations } = get();
    return evaluations.filter((e) => e.employeeId === employeeId);
  },
  
  calculateScore: (employeeId) => {
    const { employees } = get();
    const employee = employees.find((e) => e.id === employeeId);
    
    if (!employee) {
      return {
        goalScore: 0,
        competencyScore: 0,
        feedbackScore: 0,
        finalScore: 0,
      };
    }

    // Calculate goal score (60%)
    const goalScore = employee.goals.reduce((acc, goal) => {
      const achievementRate = (goal.achieved / goal.target) * 10;
      return acc + achievementRate * goal.weight;
    }, 0);

    // Calculate competency score (30%)
    const competencyScore = employee.competencies.reduce((acc, comp) => {
      return acc + comp.score * comp.weight;
    }, 0);

    // Calculate feedback score (10%)
    const positiveFeedbacks = employee.feedbacks.filter(
      (f) => f.type === 'positive'
    ).length;
    const feedbackScore =
      (positiveFeedbacks / Math.max(employee.feedbacks.length, 1)) * 10;

    // Calculate final weighted score
    const finalScore =
      goalScore * 0.6 + competencyScore * 0.3 + feedbackScore * 0.1;

    return {
      goalScore,
      competencyScore,
      feedbackScore,
      finalScore,
    };
  },
}));