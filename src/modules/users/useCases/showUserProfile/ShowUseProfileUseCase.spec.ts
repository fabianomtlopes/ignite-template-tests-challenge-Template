import {ShowUserProfileError} from "./ShowUserProfileError";
import { InMemoryUsersRepository} from "../../repositories/in-memory/InMemoryUsersRepository";
import {ShowUserProfileUseCase} from "./ShowUserProfileUseCase";
import { CreateUserUseCase} from "../createUser/CreateUserUseCase";


let inMemoryUserRepository: InMemoryUsersRepository;
let showUseProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;


describe("Show Profile User",() => {


  beforeEach(()=> {
    inMemoryUserRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    showUseProfileUseCase = new ShowUserProfileUseCase(inMemoryUserRepository);
  })

  it("should be able to show profile by user id.", async ()=> {

        const user = await createUserUseCase.execute({
          name: "User Test",
          email: "user@test.com",
          password: "1234"
        });

        const response = await showUseProfileUseCase.execute(String(user.id));
        expect(response).toEqual(user);
  });

  it("should not be able to show profile by wrong user id.", async ()=> {
    await expect(showUseProfileUseCase.execute('non_existent_id'))
    .rejects.toBeInstanceOf(ShowUserProfileError);
  });

})
