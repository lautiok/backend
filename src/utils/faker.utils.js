import { faker } from "@faker-js/faker/locale/es";

export const generateUser = () => {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
  };
};

export const generateProduct = () => {
  return {
    title: faker.commerce.productName(),
    code: faker.string.alphanumeric(6),
    price: faker.commerce.price(),
  };
};
