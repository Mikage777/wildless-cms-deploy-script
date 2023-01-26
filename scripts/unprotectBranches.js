import { Gitlab } from "@gitbeaker/node";
import { PLATFORM } from "../.config.js";
import { colors } from "../colors.js";

export default async function unprotectBranches() {
  const api = new Gitlab({
    host: PLATFORM.host,
    token: PLATFORM.token,
  });

  for (const project of PLATFORM.projects) {
    console.log(colors.white, `\nProject «${project.title}»:`);

    for (const branchName of project.branches) {
      await api.ProtectedBranches.unprotect(project.id, branchName);
      await api.ProtectedBranches.protect(project.id, branchName, {
        allow_force_push: true,
        push_access_level: 30,
        merge_access_level: 30,
      });

      console.log(colors.green, `unprotect branch «${branchName}» ...ok`);
    }
  }
}
