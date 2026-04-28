import { Body, Controller, Post } from "@nestjs/common";

type LoginPayload = {
  email: string;
  password: string;
};

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() payload: LoginPayload) {
    return {
      message: "Auth scaffold ready. Replace with real credential validation.",
      email: payload.email
    };
  }
}

