import { Controller, Get } from "@nestjs/common";

@Controller("patients")
export class PatientsController {
  @Get()
  listPatients() {
    return {
      data: [],
      message: "Patients module scaffold ready."
    };
  }
}

