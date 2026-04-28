import { Controller, Get } from "@nestjs/common";

@Controller("professionals")
export class ProfessionalsController {
  @Get()
  listProfessionals() {
    return {
      data: [],
      message: "Professionals module scaffold ready."
    };
  }
}

