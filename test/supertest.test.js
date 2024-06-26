import * as chai from "chai";
import supertest from "supertest";
import config from "../src/config/config.js";
import { generateUser, generateProduct } from "../src/utils/faker.utils.js";

const expect = chai.expect;
const requester = supertest(config.frontendUrl);

let adminToken;
const user = generateUser();
user.password = "Pass1234$";
let userId, userCartId, userToken;
const premium = generateUser();
premium.password = "Pass1234$";
premium.role = "premium";
premium.documents = [
  { name: "id", reference: "uploads/documents/id.jpg" },
  { name: "adress", reference: "uploads/documents/adress.jpg" },
  { name: "account", reference: "uploads/documents/account.jpg" },
];
let premiumId, premiumCartId, premiumToken;
const unexistingId = "000000000000000000000000";
let newUserId;
let restoreToken;
let inactiveUserId;
const product = generateProduct();
product.stock = 1000;
let productId;
const updatedProduct = { ...product };
updatedProduct.title = `${product.title} actualizado`;
const premiumProduct = generateProduct();
premiumProduct.owner = premium.email;
let premiumProductId;
const updatedPremiumProduct = { ...premiumProduct };
updatedPremiumProduct.title = `${premiumProduct.title} actualizado`;
let newCartId;
let quantity = Math.floor(Math.random() * 10) + 1;
let updatedQuantity = Math.floor(Math.random() * 10) + 1;
updatedQuantity =
  updatedQuantity === quantity ? updatedQuantity + 1 : updatedQuantity;
const productWithoutStock = generateProduct();
productWithoutStock.stock = 0;
let productWithoutStockId;

describe("Test del proyecto final del curso de Programación Backend de Coderhouse", function () {
  this.timeout(30000);
  before(async () => {
    try {
      let response = await requester
        .post("/api/sessions/login")
        .send({ email: config.adminEmail, password: config.adminPassword });
      let cookies = response.headers["set-cookie"];
      adminToken = cookies.find((cookie) => cookie.startsWith("token="));
      response = await requester.post("/api/sessions/register").send(user);
      userId = response.body.payload._id;
      userCartId = response.body.payload.cart;
      response = await requester
        .post("/api/sessions/login")
        .send({ email: user.email, password: user.password });
      cookies = response.headers["set-cookie"];
      userToken = cookies.find((cookie) => cookie.startsWith("token="));
      response = await requester.post("/api/sessions/register").send(premium);
      premiumId = response.body.payload._id;
      premiumCartId = response.body.payload.cart;
      response = await requester
        .post("/api/sessions/login")
        .send({ email: premium.email, password: premium.password });
      cookies = response.headers["set-cookie"];
      premiumToken = cookies.find((cookie) => cookie.startsWith("token="));
    } catch (error) {
      console.log(`Error en before general: ${error.message}`);
    }
  });

  describe("Test de Sessions", () => {
    describe("POST /api/sessions/register", () => {
      it("Debería crear un usuario si no hay un usuario autenticado", async () => {
        const newUser = generateUser();
        newUser.password = "Pass1234$";
        const response = await requester
          .post("/api/sessions/register")
          .send(newUser);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.not.be.null;
        expect(response.body.payload.cart).to.not.be.null;
        newUserId = response.body.payload._id;
      });
      it("No debería crear un usuario si hay un usuario autenticado", async () => {
        const response = await requester
          .post("/api/sessions/register")
          .set("Cookie", userToken)
          .send(user);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario sin nombre", async () => {
        const userWithoutFirstName = { ...user };
        delete userWithoutFirstName.first_name;
        const response = await requester
          .post("/api/sessions/register")
          .send(userWithoutFirstName);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario sin apellido", async () => {
        const userWithoutLastName = { ...user };
        delete userWithoutLastName.last_name;
        const response = await requester
          .post("/api/sessions/register")
          .send(userWithoutLastName);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario sin correo electrónico", async () => {
        const userWithoutEmail = { ...user };
        delete userWithoutEmail.email;
        const response = await requester
          .post("/api/sessions/register")
          .send(userWithoutEmail);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario sin contraseña", async () => {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        const response = await requester
          .post("/api/sessions/register")
          .send(userWithoutPassword);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario con correo electrónico inválido", async () => {
        const userWithInvalidEmail = { ...user };
        userWithInvalidEmail.email = "invalidemail.com";
        const response = await requester
          .post("/api/sessions/register")
          .send(userWithInvalidEmail);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario con contraseña inválida", async () => {
        const userWithInvalidPassword = { ...user };
        userWithInvalidPassword.password = "123456";
        const response = await requester
          .post("/api/sessions/register")
          .send(userWithInvalidPassword);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un usuario con correo electrónico repetido", async () => {
        const response = await requester
          .post("/api/sessions/register")
          .send(user);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/sessions/login", () => {
      it("Debería iniciar sesión con un usuario registrado, generar un token y almacenarlo en una cookie si no hay un usuario autenticado", async () => {
        const response = await requester
          .post("/api/sessions/login")
          .send({ email: user.email, password: user.password });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        const cookies = response.headers["set-cookie"];
        expect(cookies).to.not.be.undefined;
        const token = cookies.find((cookie) => cookie.startsWith("token="));
        expect(token).to.not.be.undefined;
      });
      it("No debería iniciar sesión con un usuario autenticado", async () => {
        const response = await requester
          .post("/api/sessions/login")
          .set("Cookie", userToken)
          .send({ email: user.email, password: user.password });
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería iniciar sesión con un usuario sin correo electrónico", async () => {
        const response = await requester
          .post("/api/sessions/login")
          .send({ password: user.password });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería iniciar sesión con un usuario sin contraseña", async () => {
        const response = await requester
          .post("/api/sessions/login")
          .send({ email: user.email });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería iniciar sesión con un usuario no registrado", async () => {
        const response = await requester
          .post("/api/sessions/login")
          .send({ email: "unregistered@user.com", password: "123456" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería iniciar sesión con una contraseña incorrecta", async () => {
        const response = await requester
          .post("/api/sessions/login")
          .send({ email: user.email, password: "123456" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/sessions/restore-password", () => {
      it("Debería enviar un correo electrónico con un enlace para reestablecer la contraseña", async () => {
        const response = await requester
          .post("/api/sessions/restore-password")
          .send({ email: user.email });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        restoreToken = response.body.payload;
        expect(restoreToken).to.not.be.undefined;
      });
      it("No debería enviar un correo electrónico con un enlace para reestablecer la contraseña con un usuario autenticado", async () => {
        const response = await requester
          .post("/api/sessions/restore-password")
          .set("Cookie", userToken)
          .send({ email: user.email });
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería enviar un correo electrónico con un enlace para reestablecer la contraseña sin correo electrónico", async () => {
        const response = await requester.post("/api/sessions/restore-password");
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería enviar un correo electrónico con un enlace para reestablecer la contraseña con correo electrónico inválido", async () => {
        const response = await requester
          .post("/api/sessions/restore-password")
          .send({ email: "invalidemail.com" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería enviar un correo electrónico con un enlace para reestablecer la contraseña con correo electrónico no registrado", async () => {
        const response = await requester
          .post("/api/sessions/restore-password")
          .send({ email: "unregistered@user.com" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/sessions/reset-password", () => {
      it("Debería reestablecer la contraseña de un usuario con el token enviado por correo electrónico", async () => {
        const response = await requester
          .post("/api/sessions/reset-password")
          .send({ token: restoreToken, password: "NewPass1234$" });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("No debería reestablecer la contraseña con un usuario autenticado", async () => {
        const response = await requester
          .post("/api/sessions/reset-password")
          .set("Cookie", userToken)
          .send({ token: restoreToken, password: "NewPass1234$" });
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería reestablecer la contraseña sin nueva contraseña", async () => {
        const response = await requester
          .post("/api/sessions/reset-password")
          .send({ token: restoreToken });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería reestablecer la contraseña con una nueva contraseña inválida", async () => {
        const response = await requester
          .post("/api/sessions/reset-password")
          .send({ token: restoreToken, password: "123456" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería reestablecer la contraseña con un token inválido", async () => {
        const response = await requester
          .post("/api/sessions/reset-password")
          .send({ token: "invalidtoken", password: "NewPass1234$" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería reestablecer la contraseña si la nueva contraseña es igual a la anterior", async () => {
        const response = await requester
          .post("/api/sessions/reset-password")
          .send({ token: restoreToken, password: "NewPass1234$" });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("GET /api/sessions/current", () => {
      it("Debería devolver el usuario autenticado", async () => {
        const response = await requester
          .get("/api/sessions/current")
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(userId);
      });
      it("No debería devolver el usuario si no está autenticado", async () => {
        const response = await requester.get("/api/sessions/current");
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/sessions/logout", () => {
      it("Debería cerrar la sesión del usuario autenticado", async () => {
        const response = await requester
          .post("/api/sessions/logout")
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("No debería cerrar la sesión del usuario si no está autenticado", async () => {
        const response = await requester.post("/api/sessions/logout");
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
    });
  });

  describe("Test de Users", () => {
    before(async () => {
      try {
        const inactiveUser = generateUser();
        inactiveUser.password = "Pass1234$";
        inactiveUser.last_connection = new Date().setDate(
          new Date().getDate() - 3
        );
        const response = await requester
          .post("/api/sessions/register")
          .send(inactiveUser);
        inactiveUserId = response.body.payload._id;
      } catch (error) {
        console.log(`Error en before de Users: ${error.message}`);
      }
    });

    describe("GET /api/users", () => {
      it("No debería devolver un array de usuarios sin estar autenticado", async () => {
        const response = await requester.get("/api/users");
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería devolver un array de usuarios autenticado como user", async () => {
        const response = await requester
          .get("/api/users")
          .set("Cookie", userToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería devolver un array de usuarios autenticado como premium", async () => {
        const response = await requester
          .get("/api/users")
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería devolver un array de usuarios autenticado como admin", async () => {
        const response = await requester
          .get("/api/users")
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(Array.isArray(response.body.payload.docs)).to.be.true;
      });
    });

    describe("GET /api/users/:uid", () => {
      it("No debería devolver un usuario sin estar autenticado", async () => {
        const response = await requester.get(`/api/users/${userId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería devolver un usuario autenticado como user", async () => {
        const response = await requester
          .get(`/api/users/${userId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(userId);
      });
      it("Debería devolver un usuario autenticado como premium", async () => {
        const response = await requester
          .get(`/api/users/${premiumId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(premiumId);
      });
      it("Debería devolver un usuario autenticado como admin", async () => {
        const response = await requester
          .get(`/api/users/${userId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(userId);
      });
      it("No debería devolver un usuario distinto al autenticado", async () => {
        const response = await requester
          .get(`/api/users/${premiumId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería devolver un usuario inexistente", async () => {
        const response = await requester
          .get(`/api/users/${unexistingId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/users/:uid/documents", () => {
      it("No debería subir documentos sin estar autenticado", async () => {
        const response = await requester
          .post(`/api/users/${userId}/documents`)
          .attach("profile", "test/files/test.png")
          .attach("id", "test/files/test.png")
          .attach("adress", "test/files/test.png")
          .attach("account", "test/files/test.png");
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería subir documentos al usuario autenticado", async () => {
        const response = await requester
          .post(`/api/users/${premiumId}/documents`)
          .set("Cookie", premiumToken)
          .attach("profile", "test/files/test.png")
          .attach("id", "test/files/test.png")
          .attach("adress", "test/files/test.png")
          .attach("account", "test/files/test.png");
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("No debería subir documentos autenticado como admin", async () => {
        const response = await requester
          .post(`/api/users/${userId}/documents`)
          .set("Cookie", adminToken)
          .attach("profile", "test/files/test.png")
          .attach("id", "test/files/test.png")
          .attach("adress", "test/files/test.png")
          .attach("account", "test/files/test.png");
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería subir documentos a un usuario distinto al autenticado", async () => {
        const response = await requester
          .post(`/api/users/${premiumId}/documents`)
          .set("Cookie", userToken)
          .attach("profile", "test/files/test.png")
          .attach("id", "test/files/test.png")
          .attach("adress", "test/files/test.png")
          .attach("account", "test/files/test.png");
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería subir documentos a un usuario inexistente", async () => {
        const response = await requester
          .post(`/api/users/${unexistingId}/documents`)
          .set("Cookie", userToken)
          .attach("profile", "test/files/test.png")
          .attach("id", "test/files/test.png")
          .attach("adress", "test/files/test.png")
          .attach("account", "test/files/test.png");
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería subir documentos en un formato no permitido", async () => {
        const response = await requester
          .post(`/api/users/${premiumId}/documents`)
          .set("Cookie", premiumToken)
          .attach("profile", "test/files/test.txt")
          .attach("id", "test/files/test.txt")
          .attach("adress", "test/files/test.txt")
          .attach("account", "test/files/test.txt");
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("PUT /api/users/premium/:uid", () => {
      it("No debería cambiar el rol de un usuario sin estar autenticado", async () => {
        const response = await requester.put(`/api/users/premium/${userId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería cambiar el rol de un usuario autenticado como premium a user", async () => {
        const response = await requester
          .put(`/api/users/premium/${premiumId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.role).to.equal("user");
      });
      it("Debería cambiar el rol de un usuario autenticado como user a premium", async () => {
        const response = await requester
          .put(`/api/users/premium/${premiumId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.role).to.equal("premium");
      });
      it("Debería cambiar el rol de un usuario premium a user autenticado como admin", async () => {
        const response = await requester
          .put(`/api/users/premium/${premiumId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.role).to.equal("user");
      });
      it("Debería cambiar el rol de un usuario user a premium autenticado como admin", async () => {
        const response = await requester
          .put(`/api/users/premium/${premiumId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.role).to.equal("premium");
      });
      it("No debería cambiar el rol de un usuario distinto al autenticado", async () => {
        const response = await requester
          .put(`/api/users/premium/${premiumId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería cambiar el rol de un usuario inexistente", async () => {
        const response = await requester
          .put(`/api/users/premium/${unexistingId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería cambiar el rol de un usuario a premium si no ha subido los documentos necesarios", async () => {
        const response = await requester
          .put(`/api/users/premium/${userId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("DELETE /api/users", () => {
      it("No debería eliminar usuarios inactivos sin estar autenticado", async () => {
        const response = await requester.delete("/api/users");
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar usuarios inactivos autenticado como user", async () => {
        const response = await requester
          .delete("/api/users")
          .set("Cookie", userToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar usuarios inactivos autenticado como premium", async () => {
        const response = await requester
          .delete("/api/users")
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería eliminar usuarios inactivos autenticado como admin", async () => {
        const response = await requester
          .delete("/api/users")
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
    });

    describe("DELETE /api/users/:uid", () => {
      it("No debería eliminar un usuario sin estar autenticado", async () => {
        const response = await requester.delete(`/api/users/${newUserId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un usuario autenticado como user", async () => {
        const response = await requester
          .delete(`/api/users/${newUserId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un usuario autenticado como premium", async () => {
        const response = await requester
          .delete(`/api/users/${newUserId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería eliminar un usuario autenticado como admin", async () => {
        const response = await requester
          .delete(`/api/users/${newUserId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(newUserId);
      });
      it("No debería eliminar un usuario inexistente", async () => {
        const response = await requester
          .delete(`/api/users/${unexistingId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });
  });

  describe("Test de Products", () => {
    describe("POST /api/products", () => {
      it("No debería crear un producto sin estar autenticado", async () => {
        const response = await requester.post("/api/products").send(product);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un producto autenticado como user", async () => {
        const response = await requester
          .post("/api/products")
          .set("Cookie", userToken)
          .send(product);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería crear un producto autenticado como premium", async () => {
        const response = await requester
          .post("/api/products")
          .set("Cookie", premiumToken)
          .send(premiumProduct);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.not.be.null;
        premiumProductId = response.body.payload._id;
      });
      it("Debería crear un producto autenticado como admin", async () => {
        const response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(product);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.not.be.null;
        productId = response.body.payload._id;
      });
      it("No debería crear un producto sin título", async () => {
        const productWithoutTitle = { ...product };
        delete productWithoutTitle.title;
        const response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(productWithoutTitle);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un producto sin código", async () => {
        const productWithoutCode = { ...product };
        delete productWithoutCode.code;
        const response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(productWithoutCode);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un producto sin precio", async () => {
        const productWithoutPrice = { ...product };
        delete productWithoutPrice.price;
        const response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(productWithoutPrice);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un producto con código repetido", async () => {
        const response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(product);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("GET /api/products", () => {
      it("Debería devolver un array de productos sin estar autenticado", async () => {
        const response = await requester.get("/api/products");
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(Array.isArray(response.body.payload.docs)).to.be.true;
      });
      it("Debería devolver un array de productos autenticado como user", async () => {
        const response = await requester
          .get("/api/products")
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(Array.isArray(response.body.payload.docs)).to.be.true;
      });
      it("Debería devolver un array de productos autenticado como premium", async () => {
        const response = await requester
          .get("/api/products")
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(Array.isArray(response.body.payload.docs)).to.be.true;
      });
      it("Debería devolver un array de productos autenticado como admin", async () => {
        const response = await requester
          .get("/api/products")
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(Array.isArray(response.body.payload.docs)).to.be.true;
      });
    });

    describe("GET /api/products/:pid", () => {
      it("Debería devolver un producto sin estar autenticado", async () => {
        const response = await requester.get(`/api/products/${productId}`);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(productId);
      });
      it("Debería devolver un producto autenticado como user", async () => {
        const response = await requester
          .get(`/api/products/${productId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(productId);
      });
      it("Debería devolver un producto autenticado como premium", async () => {
        const response = await requester
          .get(`/api/products/${productId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(productId);
      });
      it("Debería devolver un producto autenticado como admin", async () => {
        const response = await requester
          .get(`/api/products/${productId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(productId);
      });
      it("No debería devolver un producto inexistente", async () => {
        const response = await requester.get(`/api/products/${unexistingId}`);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("PUT /api/products/:pid", () => {
      it("No debería actualizar un producto sin estar autenticado", async () => {
        const response = await requester
          .put(`/api/products/${productId}`)
          .send(updatedProduct);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar un producto autenticado como user", async () => {
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", userToken)
          .send(updatedProduct);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería actualizar un producto autenticado como premium", async () => {
        const response = await requester
          .put(`/api/products/${premiumProductId}`)
          .set("Cookie", premiumToken)
          .send(updatedPremiumProduct);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.title).to.equal(
          updatedPremiumProduct.title
        );
      });
      it("Debería actualizar un producto autenticado como admin", async () => {
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", adminToken)
          .send(updatedProduct);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.title).to.equal(updatedProduct.title);
      });
      it("No debería actualizar un producto sin título", async () => {
        const productWithoutTitle = { ...updatedProduct };
        delete productWithoutTitle.title;
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", adminToken)
          .send(productWithoutTitle);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar un producto sin código", async () => {
        const productWithoutCode = { ...updatedProduct };
        delete productWithoutCode.code;
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", adminToken)
          .send(productWithoutCode);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar un producto sin precio", async () => {
        const productWithoutPrice = { ...updatedProduct };
        delete productWithoutPrice.price;
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", adminToken)
          .send(productWithoutPrice);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar un producto inexistente", async () => {
        const response = await requester
          .put(`/api/products/${unexistingId}`)
          .set("Cookie", adminToken)
          .send(updatedProduct);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar un producto autenticado como premium si no es el dueño", async () => {
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", premiumToken)
          .send(updatedProduct);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar un producto con código repetido", async () => {
        const response = await requester
          .put(`/api/products/${productId}`)
          .set("Cookie", adminToken)
          .send(premiumProduct);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("DELETE /api/products/:pid", () => {
      it("No debería eliminar un producto sin estar autenticado", async () => {
        const response = await requester.delete(`/api/products/${productId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un producto autenticado como user", async () => {
        const response = await requester
          .delete(`/api/products/${productId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería eliminar un producto autenticado como premium", async () => {
        const response = await requester
          .delete(`/api/products/${premiumProductId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(premiumProductId);
      });
      it("No debería eliminar un producto autenticado como premium si no es el dueño", async () => {
        const response = await requester
          .delete(`/api/products/${productId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("Debería eliminar un producto autenticado como admin", async () => {
        const response = await requester
          .delete(`/api/products/${productId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(productId);
      });
      it("No debería eliminar un producto inexistente", async () => {
        const response = await requester
          .delete(`/api/products/${unexistingId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });
  });

  describe("Test de Carts", () => {
    before(async () => {
      try {
        let response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(product);
        productId = response.body.payload._id;
        response = await requester
          .post("/api/products")
          .set("Cookie", premiumToken)
          .send(premiumProduct);
        premiumProductId = response.body.payload._id;
        response = await requester
          .post("/api/products")
          .set("Cookie", adminToken)
          .send(productWithoutStock);
        productWithoutStockId = response.body.payload._id;
      } catch (error) {
        console.log(`Error en before de carts: ${error.message}`);
      }
    });

    describe("GET /api/carts/:cid", () => {
      it("No debería devolver un carrito sin estar autenticado", async () => {
        const response = await requester.get(`/api/carts/${userCartId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería devolver un carrito autenticado como user", async () => {
        const response = await requester
          .get(`/api/carts/${userCartId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(userCartId);
      });
      it("Debería devolver un carrito autenticado como premium", async () => {
        const response = await requester
          .get(`/api/carts/${premiumCartId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(premiumCartId);
      });
      it("Debería devolver un carrito autenticado como admin", async () => {
        const response = await requester
          .get(`/api/carts/${userCartId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.equal(userCartId);
      });
      it("No debería devolver un carrito que no le pertenece al usuario autenticado", async () => {
        const response = await requester
          .get(`/api/carts/${premiumCartId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería devolver un carrito inexistente", async () => {
        const response = await requester
          .get(`/api/carts/${unexistingId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/carts", () => {
      it("No debería crear un carrito sin estar autenticado", async () => {
        const response = await requester.post("/api/carts");
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un carrito autenticado como user", async () => {
        const response = await requester
          .post("/api/carts")
          .set("Cookie", userToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería crear un carrito autenticado como premium", async () => {
        const response = await requester
          .post("/api/carts")
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería crear un carrito autenticado como admin", async () => {
        const response = await requester
          .post("/api/carts")
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.not.be.null;
        expect(response.body.payload.products).to.be.an("array").that.is.empty;
        newCartId = response.body.payload._id;
      });
    });

    describe("POST /api/carts/:cid/products/:pid", () => {
      it("No debería agregar un producto a un carrito sin estar autenticado", async () => {
        const response = await requester
          .post(`/api/carts/${userCartId}/products/${productId}`)
          .send({ quantity });
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería agregar un producto a un carrito autenticado como user", async () => {
        const response = await requester
          .post(`/api/carts/${userCartId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("Debería agregar un producto a un carrito autenticado como premium", async () => {
        const response = await requester
          .post(`/api/carts/${premiumCartId}/products/${productId}`)
          .set("Cookie", premiumToken)
          .send({ quantity });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("Debería agregar un producto a un carrito autenticado como admin", async () => {
        const response = await requester
          .post(`/api/carts/${newCartId}/products/${productId}`)
          .set("Cookie", adminToken)
          .send({ quantity });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("No debería agregar un producto a un carrito que no le pertenece al usuario autenticado", async () => {
        const response = await requester
          .post(`/api/carts/${premiumCartId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería agregar un producto a un carrito inexistente", async () => {
        const response = await requester
          .post(`/api/carts/${unexistingId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería agregar un producto inexistente a un carrito", async () => {
        const response = await requester
          .post(`/api/carts/${userCartId}/products/${unexistingId}`)
          .set("Cookie", userToken)
          .send({ quantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería agregar un producto que le pertenece autenticado como premium", async () => {
        const response = await requester
          .post(`/api/carts/${premiumCartId}/products/${premiumProductId}`)
          .set("Cookie", premiumToken)
          .send({ quantity: quantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("PUT /api/carts/:cid/products/:pid", () => {
      it("No debería actualizar la cantidad de un producto en un carrito sin estar autenticado", async () => {
        const response = await requester
          .put(`/api/carts/${userCartId}/products/${productId}`)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería actualizar la cantidad de un producto en un carrito autenticado como user", async () => {
        const response = await requester
          .put(`/api/carts/${userCartId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("Debería actualizar la cantidad de un producto en un carrito autenticado como premium", async () => {
        const response = await requester
          .put(`/api/carts/${premiumCartId}/products/${productId}`)
          .set("Cookie", premiumToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("Debería actualizar la cantidad de un producto en un carrito autenticado como admin", async () => {
        const response = await requester
          .put(`/api/carts/${newCartId}/products/${productId}`)
          .set("Cookie", adminToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("No debería actualizar la cantidad de un producto en un carrito que no le pertenece al usuario autenticado", async () => {
        const response = await requester
          .put(`/api/carts/${premiumCartId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar la cantidad de un producto en un carrito inexistente", async () => {
        const response = await requester
          .put(`/api/carts/${unexistingId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar la cantidad de un producto inexistente en un carrito", async () => {
        const response = await requester
          .put(`/api/carts/${userCartId}/products/${unexistingId}`)
          .set("Cookie", userToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería actualizar la cantidad de un producto que no se encuentra en el carrito", async () => {
        const response = await requester
          .put(`/api/carts/${userCartId}/products/${premiumProductId}`)
          .set("Cookie", userToken)
          .send({ quantity: updatedQuantity });
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("DELETE /api/carts/:cid/products/:pid", () => {
      it("No debería eliminar un producto de un carrito sin estar autenticado", async () => {
        const response = await requester.delete(
          `/api/carts/${userCartId}/products/${productId}`
        );
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería eliminar un producto de un carrito autenticado como user", async () => {
        const response = await requester
          .delete(`/api/carts/${userCartId}/products/${productId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        const { products } = response.body.payload;
        const productExists = products.some((p) => p.product._id === productId);
        expect(productExists).to.be.false;
      });
      it("Debería eliminar un producto de un carrito autenticado como premium", async () => {
        const response = await requester
          .delete(`/api/carts/${premiumCartId}/products/${productId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        const { products } = response.body.payload;
        const productExists = products.some((p) => p.product._id === productId);
        expect(productExists).to.be.false;
      });
      it("Debería eliminar un producto de un carrito autenticado como admin", async () => {
        const response = await requester
          .delete(`/api/carts/${newCartId}/products/${productId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        const { products } = response.body.payload;
        const productExists = products.some((p) => p.product._id === productId);
        expect(productExists).to.be.false;
      });
      it("No debería eliminar un producto de un carrito que no le pertenece al usuario autenticado", async () => {
        const response = await requester
          .delete(`/api/carts/${premiumCartId}/products/${productId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un producto de un carrito inexistente", async () => {
        const response = await requester
          .delete(`/api/carts/${unexistingId}/products/${productId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un producto inexistente de un carrito", async () => {
        const response = await requester
          .delete(`/api/carts/${userCartId}/products/${unexistingId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un producto que no se encuentra en el carrito", async () => {
        const response = await requester
          .delete(`/api/carts/${userCartId}/products/${productId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("PUT /api/carts/:cid", () => {
      before(async () => {
        try {
          await requester
            .post(`/api/carts/${userCartId}/products/${productId}`)
            .set("Cookie", userToken)
            .send({ quantity });
          await requester
            .post(`/api/carts/${premiumCartId}/products/${productId}`)
            .set("Cookie", premiumToken)
            .send({ quantity });
          await requester
            .post(`/api/carts/${newCartId}/products/${productId}`)
            .set("Cookie", adminToken)
            .send({ quantity });
        } catch (error) {
          console.log(
            `Error en before de PUT /api/carts/:cid: ${error.message}`
          );
        }
      });

      it("No debería vaciar un carrito sin estar autenticado", async () => {
        const response = await requester.put(`/api/carts/${userCartId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería vaciar un carrito autenticado como user", async () => {
        const response = await requester
          .put(`/api/carts/${userCartId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.products).to.be.empty;
      });
      it("Debería vaciar un carrito autenticado como premium", async () => {
        const response = await requester
          .put(`/api/carts/${premiumCartId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.products).to.be.empty;
      });
      it("Debería vaciar un carrito autenticado como admin", async () => {
        const response = await requester
          .put(`/api/carts/${newCartId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.products).to.be.empty;
      });
      it("No debería vaciar un carrito que no le pertenece al usuario autenticado", async () => {
        const response = await requester
          .put(`/api/carts/${premiumCartId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería vaciar un carrito inexistente", async () => {
        const response = await requester
          .put(`/api/carts/${unexistingId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });

    describe("POST /api/carts/:cid/purchase", () => {
      before(async () => {
        try {
          await requester
            .post(`/api/carts/${userCartId}/products/${productId}`)
            .set("Cookie", userToken)
            .send({ quantity });
          await requester
            .post(`/api/carts/${premiumCartId}/products/${productId}`)
            .set("Cookie", premiumToken)
            .send({ quantity });
          await requester
            .post(`/api/carts/${newCartId}/products/${productId}`)
            .set("Cookie", adminToken)
            .send({ quantity });
        } catch (error) {
          console.log(
            `Error en before de POST /api/carts/:cid/purchase: ${error.message}`
          );
        }
      });

      it("No debería realizar una compra sin estar autenticado", async () => {
        const response = await requester.post(
          `/api/carts/${userCartId}/purchase`
        );
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("Debería realizar una compra si los productos del carrito tienen stock autenticado como user", async () => {
        const response = await requester
          .post(`/api/carts/${userCartId}/purchase`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.ticket).to.not.be.null;
        expect(response.body.payload.productsNotPurchased).to.be.null;
      });
      it("Debería realizar una compra si los productos del carrito tienen stock autenticado como premium", async () => {
        const response = await requester
          .post(`/api/carts/${premiumCartId}/purchase`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.ticket).to.not.be.null;
        expect(response.body.payload.productsNotPurchased).to.be.null;
      });
      it("No debería realizar una compra autenticado como admin", async () => {
        const response = await requester
          .post(`/api/carts/${newCartId}/purchase`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería realizar una compra de un carrito inexistente", async () => {
        const response = await requester
          .post(`/api/carts/${unexistingId}/purchase`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería realizar una compra de un carrito que no le pertenece al usuario autenticado", async () => {
        const response = await requester
          .post(`/api/carts/${premiumCartId}/purchase`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("No debería realizar una compra de un carrito que contiene productos sin stock", async () => {
        await requester
          .post(`/api/carts/${userCartId}/products/${productWithoutStockId}`)
          .set("Cookie", userToken)
          .send({ quantity });
        const response = await requester
          .post(`/api/carts/${userCartId}/purchase`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
      it("Debería realizar parcialmente una compra de un carrito que contiene productos con stock y sin stock", async () => {
        await requester
          .post(`/api/carts/${userCartId}/products/${productId}`)
          .set("Cookie", userToken)
          .send({ quantity });
        const response = await requester
          .post(`/api/carts/${userCartId}/purchase`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload.ticket).to.not.be.null;
        expect(response.body.payload.productsNotPurchased).to.not.be.null;
      });
    });

    describe("DELETE /api/carts/:cid", () => {
      it("No debería eliminar un carrito sin estar autenticado", async () => {
        const response = await requester.delete(`/api/carts/${newCartId}`);
        expect(response.status).to.equal(401);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un carrito autenticado como user", async () => {
        const response = await requester
          .delete(`/api/carts/${userCartId}`)
          .set("Cookie", userToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("No debería eliminar un carrito autenticado como premium", async () => {
        const response = await requester
          .delete(`/api/carts/${premiumCartId}`)
          .set("Cookie", premiumToken);
        expect(response.status).to.equal(403);
        expect(response.body.status).to.equal("error");
      });
      it("Debería eliminar un carrito autenticado como admin", async () => {
        const response = await requester
          .delete(`/api/carts/${newCartId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
      });
      it("No debería eliminar un carrito inexistente", async () => {
        const response = await requester
          .delete(`/api/carts/${unexistingId}`)
          .set("Cookie", adminToken);
        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
      });
    });
  });

  after(async () => {
    try {
      await requester.delete(`/api/users/${userId}`).set("Cookie", adminToken);
      await requester
        .delete(`/api/users/${premiumId}`)
        .set("Cookie", adminToken);
      await requester
        .delete(`/api/users/${newUserId}`)
        .set("Cookie", adminToken);
      await requester
        .delete(`/api/products/${productId}`)
        .set("Cookie", adminToken);
      await requester
        .delete(`/api/products/${premiumProductId}`)
        .set("Cookie", adminToken);
      await requester
        .delete(`/api/products/${productWithoutStockId}`)
        .set("Cookie", adminToken);
      await requester.delete("/api/tickets").set("Cookie", adminToken);
    } catch (error) {
      console.log(`Error en after general: ${error.message}`);
    }
  });
});
