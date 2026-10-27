
export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  currency: string;
  job_title: string;
  department_id: number;
  hire_date: string;
  salary: string;
  is_active: boolean;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
}

export interface Department {
  id: number;
  name: string;
  employee_count: number;
}



export interface SalaryHistory {
  id: number;
  previous_salary: string | null;
  new_salary: string;
  effective_date: string;
  changed_at: string;
}

export interface EmployeeDetail extends Employee {
  department_name: string;
  salary_history: SalaryHistory[];
}

export interface SalaryUpdateResponse {
  employee_id: number;
  previous_salary: string;
  new_salary: string;
  effective_date: string;
  message: string;
}
