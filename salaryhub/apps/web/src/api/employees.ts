
import { apiClient } from "./client";
import type { Department, EmployeeListResponse, EmployeeDetail, SalaryUpdateResponse } from "../types";

export interface EmployeeFilters {
  q?: string;
  department_id?: number;
  is_active?: boolean;
  page: number;
  page_size: number;
}

export async function getEmployees(filters: EmployeeFilters) {
  const response = await apiClient.get<EmployeeListResponse>("/employees", {
    params: filters,
  });

  return response.data;
}

export async function getDepartments() {
  const response = await apiClient.get<Department[]>("/departments");
  return response.data;
}


export async function getEmployee(employeeId: number) {
  const response = await apiClient.get<EmployeeDetail>(
    `/employees/${employeeId}`,
  );
  return response.data;
}

export async function updateEmployeeSalary(
  employeeId: number,
  newSalary: string,
  effectiveDate: string,
) {
  const response = await apiClient.patch<SalaryUpdateResponse>(
    `/employees/${employeeId}/salary`,
    {
      new_salary: newSalary,
      effective_date: effectiveDate,
    },
  );

  return response.data;
}
