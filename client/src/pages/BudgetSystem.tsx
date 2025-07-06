import { useState } from "react";
import Navigation from "@/components/Navigation";
import BudgetModule from "@/components/BudgetModule";
import EmployeeModule from "@/components/EmployeeModule";
import TravelModule from "@/components/TravelModule";
import AssistanceModule from "@/components/AssistanceModule";
import WorkdayModule from "@/components/WorkdayModule";
import SummaryModule from "@/components/SummaryModule";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, RotateCcw } from "lucide-react";
import { exportToExcel } from "@/utils/excelUtils";


type ActiveModule = "budget" | "config" | "travel" | "assistance" | "workday" | "summary";

export default function BudgetSystem() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("summary");
  const { toast } = useToast();

  const handleExportExcel = () => {
    try {
      exportToExcel();
      toast({
        title: "ส่งออกสำเร็จ",
        description: "ไฟล์ Excel ได้ถูกส่งออกแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกไฟล์ Excel ได้",
        variant: "destructive",
      });
    }
  };

  const handleImportEmployees = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Process Excel file for employee import
        toast({
          title: "นำเข้าสำเร็จ",
          description: "ข้อมูลพนักงานได้รับการนำเข้าแล้ว",
        });
      }
    };
    input.click();
  };

  const handleResetSystem = () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตระบบ? ข้อมูลทั้งหมดจะหายไป")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderMainContent = () => {
    switch (activeModule) {
      case "budget":
        return <BudgetModule />;
      case "config":
        return <EmployeeModule />;
      case "travel":
        return <TravelModule />;
      case "assistance":
        return <AssistanceModule />;
      case "workday":
        return <WorkdayModule />;
      case "summary":
        return <SummaryModule />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 text-lg">
              เลือกเมนูด้านบนเพื่อเริ่มการใช้งาน
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Main Header */}
        <header className="bg-white rounded-xl shadow-md p-6 mb-8 no-print">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
              ระบบจัดทำงบประมาณประจำปี
            </h1>

          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Download className="h-5 w-5" />
              ส่งออกงบประมาณ
            </Button>
            
            <Button
              onClick={handleImportEmployees}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Upload className="h-5 w-5" />
              นำเข้าพนักงาน
            </Button>
            
            <Button
              onClick={handleResetSystem}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            >
              <RotateCcw className="h-5 w-5" />
              รีเซ็ตระบบ
            </Button>
          </div>
        </header>

        {/* Navigation */}
        <Navigation activeModule={activeModule} setActiveModule={(module) => setActiveModule(module as ActiveModule)} />

        {/* Main Content */}
        <main id="main-content">
          {renderMainContent()}
        </main>
      </div>


    </div>
  );
}
