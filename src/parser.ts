import { uniq } from 'lodash';
import mariaDb, { Connection } from 'mariadb';

interface IMed {
  name: string
  specification: string
}
interface IMedGroup {
  system: string
  meds: IMed[]
}
interface IDefaultPrescription {
  name: string
  content: string
  system: string
}
interface IGroupedDespcriptions {
  system: string;
  prescriptions: IDefaultPrescription[];
}

// const getMeds = (): Promise<IMedGroup[]> => import(/* webpackChunkName: 'data' */'./data.json').then(mod => mod.default);
async function getMeds(): Promise<[IMedGroup[], IGroupedDespcriptions[]]> {
  const conn = await createDb() as Connection;
  // await createTables(conn);
  const { getAllMedicines, getDefaultPrescriptions } = createTools(conn);
  const allMeds = await getAllMedicines();
  const systems = uniq(allMeds.map(({ system }) => system));
  const medGroups = systems.map((system) => ({
    system,
    meds: allMeds.filter((m) => m.system === system)
  }));
  const dps = await getDefaultPrescriptions();
  const groupedDps = uniq(dps.map(({ system }) => system))
    .map(system => ({
      system,
      prescriptions: dps.filter((dp) => dp.system === system)
    }))
  return [medGroups, groupedDps];
}

function getSets(obj: any) {
  return Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      const right = typeof value === 'string' ? `'${value}'` :
        value instanceof Date ? value.getTime() : value;
      return `${key}=${right}`;
    })
    .join(', ');
}

async function createDb(): Promise<Connection | null> {
  try {
    const conn = await mariaDb.createConnection({
      host: '1.117.36.204',
      port: 3306,
      user: 'electron_user',
      password: 'yzVHhd1uBHt1YJQF',
      database: 'mysql'
    });
    return conn;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function createTables(conn: Connection) {
  await conn.query(`CREATE TABLE IF NOT EXISTS medicine (
    id MEDIUMINT NOT NULL AUTO_INCREMENT,
    ${[
        ['name', 'VARCHAR(255) CHARACTER SET utf8'],
        ['specification', 'VARCHAR(255) CHARACTER SET utf8'],
        ['system_id', 'BIGINT'],
      ]
      .map(([key, type]) => `${key} ${type}`)
      .join(',\n')
    },
    PRIMARY KEY (id)
  )`);
  await conn.query(`CREATE TABLE IF NOT EXISTS system (
    id MEDIUMINT NOT NULL AUTO_INCREMENT,
    ${[
        ['name', 'VARCHAR(255) CHARACTER SET utf8'],
      ]
      .map(([key, type]) => `${key} ${type}`)
      .join(',\n')
    },
    PRIMARY KEY (id)
  )`);
}

function createTools(conn: Connection) {
  return {
    getMedicine(name: string) {
      return conn.query(`SELECT name FROM medicine WHERE name='${name}' LIMIT 1`)
        .then((data) => data[0]);
    },
    async addMedicine(med: IMed) {
      const exists = await this.getMedicine(med.name);
      if (!exists) {
        return conn.query(`INSERT INTO medicine SET ${getSets(med)}`);
      }
      return Promise.resolve(exists);
    },
    getAllMedicines(): Promise<any[]> {
      return conn.query(`SELECT medicine.name, medicine.specification, system.name AS system
        FROM medicine
        LEFT JOIN system ON system.id=medicine.system_id`);
    },
    getDefaultPrescriptions(): Promise<IDefaultPrescription[]> {
      return conn.query(`SELECT dp.name, dp.content, system.name as system
        FROM default_prescriptions as dp
        LEFT JOIN system ON system.id=dp.system_id`);
    }
  }
}

export { IMed, IMedGroup, getMeds };