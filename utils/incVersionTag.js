import { assertUnreachable } from "./assertUnreachable.js";

const RC_SUFFIX = "RC";
const DEFAULT_RC_VER = `0.0.1-${RC_SUFFIX}1`;

const VER_SEP = ".";
const RC_SEP = "-";

export function incVersionTag(ver, targetEnv) {
  if (!ver) {
    return incVersionTag(DEFAULT_RC_VER, targetEnv);
  }

  switch (targetEnv) {
    case "test":
      return ver;
    case "rc":
      return incRC(ver);
    case "prod":
      return incProd(ver);
    default:
      assertUnreachable(targetEnv);
  }
}

const incVerPart = (_) => String(parseInt(_, 10) + 1);

function incRC(ver) {
  const [baseVer, suffix] = ver.split(RC_SEP);

  if (!suffix) {
    return `${incProd(baseVer)}${RC_SEP}${RC_SUFFIX}1`;
  }

  const [suffixIndex] = suffix.match(/\d+/) || [];

  return [
    baseVer,
    suffixIndex
      ? suffix.replace(suffixIndex, incVerPart(suffixIndex))
      : `${suffix}1`,
  ].join(RC_SEP);
}

function incProd(ver) {
  const [baseVer] = ver.split(RC_SEP);

  const verParts = baseVer.split(VER_SEP);

  return verParts
    .slice(0, -1)
    .concat(verParts.slice(-1).map(incVerPart))
    .join(VER_SEP);
}
