import { OperationType } from "../../entities/Statement";
import {InMemoryStatementsRepository} from "../../repositories/in-memory/InMemoryStatementsRepository";
import {GetBalanceUseCase} from "./GetBalanceUseCase";
import {GetBalanceError } from "./GetBalanceError";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";


let createUserUseCase : CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let inMemoryUserRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;


describe("Get Balance Use Case test",() => {

    beforeEach(() => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        inMemoryStatementRepository = new InMemoryStatementsRepository();

        createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository, inMemoryStatementRepository);

        getBalanceUseCase = new GetBalanceUseCase(
          inMemoryStatementRepository,
          inMemoryUserRepository,
        );

    });

    it("should be able to get user balance", async ()=> {

      const user = await createUserUseCase.execute({
        name: "User test",
        email: "email@test.com",
        password: "1234",
      });

      const responseStatement = [
        createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.DEPOSIT,
        amount: 2000,
        description: "first description fake ;-)"
      }),

      createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "second description fake ;-)"
      }),

      createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "thid description fake ;-)"
      }),

      createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        amount: 200,
        description: "fourth description fake ;-)"
      }),
    ];

    await Promise.all(responseStatement);

    const getBalance = await getBalanceUseCase.execute({user_id: String(user.id)})

    expect(getBalance).toHaveProperty('balance');
    expect(getBalance.balance).toBe(2200);
    expect(getBalance.statement).toHaveLength(4);

  });

  it('should not be able to get user balance if the user does not exists', async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: 'fake_id' }),
    ).rejects.toBeInstanceOf(GetBalanceError);
  });

})
