import { Employee, employees } from './employees';

export interface Team {
  id: string;
  teamName: string;
  members: Employee[];
}

export const teams: Team[] = [
  { id: 'T001', teamName: 'Alpha Team', members: employees.slice(0, 3) },
  { id: 'T002', teamName: 'Beta Team', members: employees.slice(3, 6) },
  { id: 'T003', teamName: 'Gamma Team', members: employees.slice(6, 9) },
  { id: 'T004', teamName: 'Delta Team', members: employees.slice(9, 12) },
  { id: 'T005', teamName: 'Epsilon Team', members: employees.slice(12, 15) },
  { id: 'T006', teamName: 'Zeta Team', members: employees.slice(15, 18) },
  { id: 'T007', teamName: 'Eta Team', members: employees.slice(18, 21) },
  { id: 'T008', teamName: 'Theta Team', members: employees.slice(21, 24) },
  { id: 'T009', teamName: 'Iota Team', members: employees.slice(24, 27) },
  { id: 'T010', teamName: 'Kappa Team', members: employees.slice(27, 30) },
];
