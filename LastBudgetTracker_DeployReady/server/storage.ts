import {
  budgetItems,
  employees,
  masterRates,
  travelExpenses,
  assistancePayments,
  overtimePayments,
  workingDays,
  type BudgetItem,
  type InsertBudgetItem,
  type Employee,
  type InsertEmployee,
  type MasterRate,
  type InsertMasterRate,
  type TravelExpense,
  type InsertTravelExpense,
  type AssistancePayment,
  type InsertAssistancePayment,
  type OvertimePayment,
  type InsertOvertimePayment,
  type WorkingDay,
  type InsertWorkingDay,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Budget Items
  getBudgetItems(): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem>;
  deleteBudgetItem(id: number): Promise<void>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;

  // Master Rates
  getMasterRates(): Promise<MasterRate[]>;
  createMasterRate(rate: InsertMasterRate): Promise<MasterRate>;
  updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate>;

  // Travel Expenses
  getTravelExpenses(): Promise<TravelExpense[]>;
  createTravelExpense(expense: InsertTravelExpense): Promise<TravelExpense>;
  updateTravelExpense(id: number, expense: Partial<InsertTravelExpense>): Promise<TravelExpense>;

  // Assistance Payments
  getAssistancePayments(): Promise<AssistancePayment[]>;
  createAssistancePayment(payment: InsertAssistancePayment): Promise<AssistancePayment>;
  updateAssistancePayment(id: number, payment: Partial<InsertAssistancePayment>): Promise<AssistancePayment>;

  // Overtime Payments
  getOvertimePayments(): Promise<OvertimePayment[]>;
  createOvertimePayment(payment: InsertOvertimePayment): Promise<OvertimePayment>;
  updateOvertimePayment(id: number, payment: Partial<InsertOvertimePayment>): Promise<OvertimePayment>;

  // Working Days
  getWorkingDays(): Promise<WorkingDay[]>;
  createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay>;
  updateWorkingDay(id: number, workingDay: Partial<InsertWorkingDay>): Promise<WorkingDay>;

  // Utility methods
  resetAllData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    await this.initializeDefaultData();
    this.initialized = true;
  }

  async getBudgetItems(): Promise<BudgetItem[]> {
    await this.ensureInitialized();
    return await db.select().from(budgetItems);
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    await this.ensureInitialized();
    const [budgetItem] = await db.insert(budgetItems).values(item).returning();
    return budgetItem;
  }

  async updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    await this.ensureInitialized();
    const [budgetItem] = await db
      .update(budgetItems)
      .set(item)
      .where(eq(budgetItems.id, id))
      .returning();
    return budgetItem;
  }

  async deleteBudgetItem(id: number): Promise<void> {
    await this.ensureInitialized();
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
  }

  async getEmployees(): Promise<Employee[]> {
    await this.ensureInitialized();
    return await db.select().from(employees);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    await this.ensureInitialized();
    const [emp] = await db.insert(employees).values(employee).returning();
    return emp;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    await this.ensureInitialized();
    const [emp] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return emp;
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.ensureInitialized();
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getMasterRates(): Promise<MasterRate[]> {
    await this.ensureInitialized();
    return await db.select().from(masterRates);
  }

  async createMasterRate(rate: InsertMasterRate): Promise<MasterRate> {
    await this.ensureInitialized();
    const [masterRate] = await db.insert(masterRates).values(rate).returning();
    return masterRate;
  }

  async updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate> {
    await this.ensureInitialized();
    const [masterRate] = await db
      .update(masterRates)
      .set(rate)
      .where(eq(masterRates.id, id))
      .returning();
    return masterRate;
  }

  async getTravelExpenses(): Promise<TravelExpense[]> {
    await this.ensureInitialized();
    return await db.select().from(travelExpenses);
  }

  async createTravelExpense(expense: InsertTravelExpense): Promise<TravelExpense> {
    await this.ensureInitialized();
    const [travelExpense] = await db.insert(travelExpenses).values(expense).returning();
    return travelExpense;
  }

  async updateTravelExpense(id: number, expense: Partial<InsertTravelExpense>): Promise<TravelExpense> {
    await this.ensureInitialized();
    const [travelExpense] = await db
      .update(travelExpenses)
      .set(expense)
      .where(eq(travelExpenses.id, id))
      .returning();
    return travelExpense;
  }

  async getAssistancePayments(): Promise<AssistancePayment[]> {
    await this.ensureInitialized();
    return await db.select().from(assistancePayments);
  }

  async createAssistancePayment(payment: InsertAssistancePayment): Promise<AssistancePayment> {
    await this.ensureInitialized();
    const [assistancePayment] = await db.insert(assistancePayments).values(payment).returning();
    return assistancePayment;
  }

  async updateAssistancePayment(id: number, payment: Partial<InsertAssistancePayment>): Promise<AssistancePayment> {
    await this.ensureInitialized();
    const [assistancePayment] = await db
      .update(assistancePayments)
      .set(payment)
      .where(eq(assistancePayments.id, id))
      .returning();
    return assistancePayment;
  }

  async getOvertimePayments(): Promise<OvertimePayment[]> {
    await this.ensureInitialized();
    return await db.select().from(overtimePayments);
  }

  async createOvertimePayment(payment: InsertOvertimePayment): Promise<OvertimePayment> {
    await this.ensureInitialized();
    const [overtimePayment] = await db.insert(overtimePayments).values(payment).returning();
    return overtimePayment;
  }

  async updateOvertimePayment(id: number, payment: Partial<InsertOvertimePayment>): Promise<OvertimePayment> {
    await this.ensureInitialized();
    const [overtimePayment] = await db
      .update(overtimePayments)
      .set(payment)
      .where(eq(overtimePayments.id, id))
      .returning();
    return overtimePayment;
  }

  async getWorkingDays(): Promise<WorkingDay[]> {
    await this.ensureInitialized();
    return await db.select().from(workingDays);
  }

  async createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay> {
    await this.ensureInitialized();
    const [wd] = await db.insert(workingDays).values(workingDay).returning();
    return wd;
  }

  async updateWorkingDay(id: number, workingDay: Partial<InsertWorkingDay>): Promise<WorkingDay> {
    await this.ensureInitialized();
    const [wd] = await db
      .update(workingDays)
      .set(workingDay)
      .where(eq(workingDays.id, id))
      .returning();
    return wd;
  }

  async resetAllData(): Promise<void> {
    await db.delete(budgetItems);
    await db.delete(employees);
    await db.delete(masterRates);
    await db.delete(travelExpenses);
    await db.delete(assistancePayments);
    await db.delete(overtimePayments);
    await db.delete(workingDays);
    
    this.initialized = false;
    await this.ensureInitialized();
  }

  private async initializeDefaultData() {
    // Check if data already exists
    const existingBudget = await db.select().from(budgetItems).limit(1);
    if (existingBudget.length > 0) return;

    // Initialize default data here
    // For now, we'll keep it empty and let the frontend populate it
  }
}

export const storage = new DatabaseStorage();