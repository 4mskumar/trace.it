import RepoWorkspace from "@/components/RepoWorkSpace";

type RepositoryPageProps = { //ye params aa rahe hai as a promise
  params: Promise<{
    owner: string;
    repo: string;
    id: string;
  }>;
};

export default async function RepositoryPage({
  params,
}: RepositoryPageProps) {
  const { owner, repo, id } = await params;
  console.log(id);
  
  return (
    <RepoWorkspace owner={owner} repo={repo} repositoryId={id} />
  );
}