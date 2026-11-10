import { Octokit } from "@octokit/rest";

export function createGitHubClient(accessToken: string) {
  console.log(accessToken);
  
  return new Octokit({
    auth: accessToken,
  });
}