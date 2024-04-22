export const generateErrorInfo=(user)=>{
    return `Una o más propiedades estaban incompletas o inválidas.
      Lista de propiedades requeridas:
     * first_name: necesita un String, se recibió ${user.first_name}
      * last_name: necesita un String, se recibió ${user.last_name}
     * email: necesita un String, se recibió ${user.email}
     `;
   }