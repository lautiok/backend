import { program } from "commander";

program
  .option("-s, --storage <type>", "Tipo de persistencia (mongo o fs)", "mongo")
  .option(
    "-e, --environment <env>",
    "Entorno de ejecución (development o produdction)",
    "development"
  )
  .parse(process.argv);

const options = program.opts();

export default options;
