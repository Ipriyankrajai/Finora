import { DataTable } from "../common/data-table";
import { ChartAreaInteractive } from "./expense-chart";
import { SectionCards } from "./section-card";
import data from "@/data/expense.json";

export function Dashboard() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}
