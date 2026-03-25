"use client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Questionnaire from "../ui/Questionnaire";

ChartJS.register(ArcElement, Tooltip, Legend);
function NewSwotPage() {
  return (
    <Questionnaire/>
  )
}

export default NewSwotPage
