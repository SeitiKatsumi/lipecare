import { Controller, Get } from "@nestjs/common";

@Controller("files")
export class FilesController {
  @Get("policy")
  getPolicy() {
    return {
      storage: "private-s3-compatible",
      access: "signed-urls-only",
      note: "Evolution photos and exams must never be public assets."
    };
  }
}

