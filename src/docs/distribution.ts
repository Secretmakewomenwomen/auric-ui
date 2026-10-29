import { name as libraryName, version as libraryVersion } from '../../packages/auricui/package.json';
import { name as skillName, version as skillVersion } from '../../packages/auricui-skill/package.json';

function distribution(name: string, version: string) {
  const filename = `${name}-${version}.tgz`;
  return {
    name,
    version,
    filename,
    href: `${import.meta.env.BASE_URL}downloads/${filename}`,
    install: `npm install ./${filename}`,
  };
}

export const libraryDistribution = distribution(libraryName, libraryVersion);
export const skillDistribution = distribution(skillName, skillVersion);
