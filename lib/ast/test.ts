import { parseTypeScript } from "./parser";

const code = `
function login(email: string) {
  return email;
}

class UserService {
}

interface User {
  id: string;
}

const token = "abc";
`;

const result = parseTypeScript(code);

console.log(result);