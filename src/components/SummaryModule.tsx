import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Employee, BudgetItem, AssistancePayment, TravelExpense, OvertimePayment, MasterRate } from "@/../../shared/schema";
import { calculateTravelTotals } from "@/components/TravelModule";
import { calculateAssistanceTotals } from "@/components/AssistanceModule";

export default function SummaryModule() {
  const [currentYear, setCurrentYear] = useState(2569);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: budgetItems = [] } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget-items'],
  });

  const { data: masterRates = [] } = useQuery<MasterRate[]>({
    queryKey: ['/api/master-rates'],
  });

  const { data: assistancePayments = [] } = useQuery<AssistancePayment[]>({
    queryKey: ['/api/assistance-payments'],
  });

  const { data: travelExpenseData = [] } = useQuery<TravelExpense[]>({
    queryKey: ['/api/travel-expenses'],
  });

  const { data: overtimePayments = [] } = useQuery<OvertimePayment[]>({
    queryKey: ['/api/overtime-payments'],
  });



  // คำนวณสรุปงบประมาณรายจ่ายดำเนินงาน
  const calculateOperatingExpenses = () => {
    const category1Total = budgetItems
      .filter(item => item.category === "หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน")
      .reduce((sum, item) => sum + (item.compareYearAmount || 0), 0);
    
    const category2Total = budgetItems
      .filter(item => item.category === "หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป")
      .reduce((sum, item) => sum + (item.compareYearAmount || 0), 0);
    
    return {
      category1: category1Total,
      category2: category2Total,
      total: category1Total + category2Total
    };
  };

  // คำนวณสรุปค่าใช้จ่ายเดินทาง (ใช้ข้อมูลจากการคำนวณจริง)
  const calculateTravelExpenses = () => {
    if (!employees) {
      return {
        souvenir: 0,
        meeting: 0,
        studentTrip: 0,
        familyVisit: 0,
        total: 0
      };
    }

    // ใช้ค่าเริ่มต้นสำหรับ workDays และ state อื่นๆ
    const defaultWorkDays: {[key: number]: number} = {};
    const defaultOtherVehicleCosts: {[key: number]: number} = {};
    const defaultAccommodationCosts: {[key: number]: number} = {};
    
    const travelTotals = calculateTravelTotals(employees, defaultWorkDays, defaultOtherVehicleCosts, defaultAccommodationCosts);

    return {
      souvenir: travelTotals.souvenir, // tab ซื้อของฝาก
      familyVisit: travelTotals.familyVisit, // tab เยี่ยมครอบครัว
      meeting: travelTotals.companyEvent, // tab ร่วมงานวันพนักงาน
      studentTrip: travelTotals.rotation, // tab หมุนเวียนงาน ผจศ.
      total: travelTotals.total
    };
  };

  // คำนวณสรุปเงินช่วยเหลือ
  const calculateAssistanceTotal = () => {
    if (!employees || !masterRates) {
      return {
        other: 0,
        special: 0,
        overtime: 0,
        total: 0
      };
    }

    // ใช้ข้อมูลจริงจาก AssistanceModule
    const activeEmployees = employees.filter(emp => emp.status === "Active");
    
    // สร้างข้อมูล assistanceData แบบเดียวกับใน AssistanceModule
    const assistanceData: {[key: number]: any} = {};
    activeEmployees.forEach(emp => {
      const level = emp.level;
      let houseRent = 0;
      let monthlyAssistance = 0;
      
      // หาอัตรามาตรฐานตามระดับ
      if (level === "7") {
        houseRent = 12000;
        monthlyAssistance = 7500;
      } else if (level === "6") {
        houseRent = 8000;
        monthlyAssistance = 6250;
      } else if (level === "5.5") {
        houseRent = 9500;
        monthlyAssistance = 6250;
      } else if (level === "5") {
        houseRent = 8000;
        monthlyAssistance = 5500;
      } else {
        houseRent = 6000;
        monthlyAssistance = 4500;
      }
      
      assistanceData[emp.id] = {
        id: emp.id,
        description: emp.fullName,
        months: 12,
        houseRent: houseRent,
        monthlyAssistance: monthlyAssistance,
        oneTimePurchase: 0,
        total: (12 * (houseRent + monthlyAssistance)) + 0
      };
    });

    // ข้อมูลเงินช่วยเหลือพิเศษ
    const specialAssistanceItems = [
      { id: 1, description: "งานบุญประจำปี", timesPerYear: 5, daysPerTime: 1, peoplePerTime: 5, assistanceRatePerDay: 300, total: 7500 },
      { id: 2, description: "งานบุญปีใหม่", timesPerYear: 1, daysPerTime: 1, peoplePerTime: 5, assistanceRatePerDay: 300, total: 1500 },
      { id: 3, description: "งานบุญสงกรานต์", timesPerYear: 1, daysPerTime: 3, peoplePerTime: 5, assistanceRatePerDay: 300, total: 4500 },
      { id: 4, description: "งานบุญผู้สูงอายุ", timesPerYear: 1, daysPerTime: 1, peoplePerTime: 5, assistanceRatePerDay: 300, total: 1500 },
      { id: 5, description: "งานบุญท้าวเวสสุวรรณ", timesPerYear: 1, daysPerTime: 1, peoplePerTime: 5, assistanceRatePerDay: 300, total: 1500 },
      { id: 6, description: "งานบุญลอยกระทง", timesPerYear: 1, daysPerTime: 1, peoplePerTime: 5, assistanceRatePerDay: 300, total: 1500 },
      { id: 7, description: "งานบุญเข้าพรรษา", timesPerYear: 1, daysPerTime: 1, peoplePerTime: 5, assistanceRatePerDay: 300, total: 1500 }
    ];

    // ข้อมูลค่าล่วงเวลา (ยังไม่มีข้อมูล)
    const overtimeItems: any[] = [];

    // ใช้ฟังก์ชันคำนวณจริง
    return calculateAssistanceTotals(employees, masterRates, assistanceData, specialAssistanceItems, overtimeItems);
  };

  const operatingExpenses = calculateOperatingExpenses();
  const travelExpensesCalc = calculateTravelExpenses();
  const assistanceTotal = calculateAssistanceTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  สรุปงบประมาณ
                </h1>
                <p className="text-gray-600 text-sm mt-1">การจัดทำงบประมาณรายจ่าย</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-lg font-semibold text-gray-800">งบประมาณ พ.ศ.</span>
                <span className="text-lg font-bold text-purple-600 ml-2">{currentYear}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* สรุปงบประมาณประจำปี */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
              <CardTitle className="text-xl font-bold">สรุปงบประมาณประจำปี</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* สรุปงบประมาณรายจ่ายดำเนินงาน */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  สรุปงบประมาณรายจ่ายดำเนินงาน:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน</span>
                    <span className="font-medium">{operatingExpenses.category1.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป</span>
                    <span className="font-medium">{operatingExpenses.category2.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-blue-600">
                    <span>ยอดรวมรายจ่ายดำเนินงาน:</span>
                    <span>{operatingExpenses.total.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>

              {/* สรุปค่าใช้จ่ายเดินทาง */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  สรุปค่าใช้จ่ายเดินทาง:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1. ค่าเดินทางรับของที่ระลึก</span>
                    <span className="font-medium">{travelExpensesCalc.souvenir.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. ค่าเดินทางเยี่ยมครอบครัว</span>
                    <span className="font-medium">{travelExpensesCalc.familyVisit.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. ค่าเดินทางร่วมงานวันพนักงาน</span>
                    <span className="font-medium">{travelExpensesCalc.meeting.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4. ค่าเดินทางผจศ.หมุนเวียนงาน</span>
                    <span className="font-medium">{travelExpensesCalc.studentTrip.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-blue-600">
                    <span>ยอดรวมค่าใช้จ่ายเดินทาง:</span>
                    <span>{travelExpensesCalc.total.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* สรุปเงินช่วยเหลือ */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6">
              <CardTitle className="text-xl font-bold">สรุปเงินช่วยเหลือ</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>เงินช่วยเหลืออื่น ๆ:</span>
                    <span className="font-medium">{assistanceTotal.other.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เงินช่วยเหลือพิเศษ:</span>
                    <span className="font-medium">{assistanceTotal.special.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าล่วงเวลา:</span>
                    <span className="font-medium">{assistanceTotal.overtime.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>ยอดรวมเงินช่วยเหลือ:</span>
                    <span>{assistanceTotal.total.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>

              {/* สรุปรวมทั้งหมด */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4 text-center">สรุปงบประมาณรวมทั้งหมด</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>รายจ่ายดำเนินงาน:</span>
                    <span className="font-medium">{operatingExpenses.total.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าใช้จ่ายเดินทาง:</span>
                    <span className="font-medium">{travelExpensesCalc.total.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เงินช่วยเหลือ:</span>
                    <span className="font-medium">{assistanceTotal.total.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-purple-300 pt-3 mt-4">
                  <div className="flex justify-between font-bold text-lg text-purple-700">
                    <span>ยอดรวมทั้งหมด:</span>
                    <span>{(operatingExpenses.total + travelExpensesCalc.total + assistanceTotal.total).toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}