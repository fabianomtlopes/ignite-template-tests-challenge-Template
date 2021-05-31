import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a new User", () =>{

      beforeEach(() => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);


      });

      it("Should be to create a new user", async () => {

        const user = await createUserUseCase.execute({
          name: "New User",
          email: "newuser@test.com",
          password: "1234",
        });

        expect(user).toHaveProperty('id');
      });

      it("Should not be to create a new user with a email exist ", async () => {

         expect(async () => {
          await createUserUseCase.execute({
            name: "New User",
            email: "newuser@test.com",
            password: "1234",
          });

          await createUserUseCase.execute({
            name: "User Joe",
            email: "newuser@test.com",
            password: "54321",
          });

         }).rejects.toBeInstanceOf(AppError);

      });
});
