import {InMemoryUsersRepository} from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository} from "../../repositories/in-memory/InMemoryStatementsRepository";

import {OperationType} from "../../entities/Statement";
import {CreateStatementUseCase} from "../createStatement/CreateStatementUseCase";
import {GetStatementOperationUseCase} from "./GetStatementOperationUseCase";
import {GetStatementOperationError} from "../getStatementOperation/GetStatementOperationError";


let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;


describe("Create and Register a Statement Operation Use Case",()=> {


  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUserRepository,inMemoryStatementsRepository);
  })


  it("shoud be able to get statement deposit using user_id and statement_id", async () => {
      const user = await inMemoryUserRepository.create({
        name: "User test",
        email: "user@test.com",
        password: "1234"
      });

      const statementUser = await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit",
      })


      const statementOperation  = await getStatementOperationUseCase.execute({
        user_id:  String(user.id),
        statement_id: String(statementUser.id),
      })

      expect(statementOperation).toHaveProperty('id');
      expect(statementOperation.id).toEqual(statementUser.id);
      expect(statementOperation).toEqual(statementUser);
  })

  it("shoud not be able to get user statement operation if user does not exist", async () => {

    await expect(getStatementOperationUseCase.execute({
      user_id: "fake_id",
      statement_id: "fake_statement"
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });


  it("shoud not be able to get user statement operation if statement does not exist", async () => {
    const user = await inMemoryUserRepository.create({
      name: "User test",
      email: "user@test.com",
      password: "1234"
    });

    await expect(getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: "fake_statement"
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });


})
