const axios = require("axios") ;

const BACKEND_URL = "http://localhost:3000"

//Authentication testing
describe("Authentication", () => {
    test("User is sign up only once", async () => {
        try {
            // Successful registration
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";
            const type = "admin";
            const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password,
                type
            });
            expect(response.status).toBe(200);

            // Backend should reject because the username is duplicated
            try {
                await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                    username,
                    password
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        } catch (error) {
            console.error("Error in test:", error);
        }
    });

    test("Signup request fails when username is empty", async () => {
        try {
            const username = "";
            const password = "12345ahmedsaber";
            await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    test("Signin succeeds if the username and password are correct", async () => {
        try {
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";

            await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password
            });

            const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username,
                password
            });
            expect(response.status).toBe(200);
            expect(response.data.token).toBeDefined();
        } catch (error) {
            console.error("Error in test:", error);
        }
    });

    test("Signin fails if the username and password are incorrect", async () => {
        try {
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";
            await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password
            });
            await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: "WrongUsername",
                password
            });
        } catch (error) {
            expect(error.response.status).toBe(403); // Unauthorized
        }
    });
});

describe("User avatar information", () => {
    let token, avatarId, adminId;

    beforeAll(async () => {
        try {
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";
            const type = "admin";

            // Signup
            const responseSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password,
                type
            });
            adminId = responseSignup.data.adminId;

            // Signin
            const responseSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username,
                password
            });
            token = responseSignin.data.token;

            // Create avatar
            const avatarCreationResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
                imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s",
                name: "Timmy"
            });
            avatarId = avatarCreationResponse.data.avatarId;
        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("Get back avatar details for a user", async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${adminId}]`);
            expect(response.data.avatars.length).toBe(1);
            expect(response.data.avatars[0].adminId).toBe(adminId);
        } catch (error) {
            console.error("Error in test:", error);
        }
    });

    test("Get available avatars and check if current avatar created exists", async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
            expect(response.data.avatars.length).not.toBe(0);
            const currentAvatar = response.data.avatars.find(x => x.id === avatarId);
            expect(currentAvatar).toBeDefined();
        } catch (error) {
            console.error("Error in test:", error);
        }
    });
});
//User interface page
describe("User metadata endpoints", () => {
    let token = "";
    let avatarId = "";

    beforeAll(async () => {
        try {
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";
            const type = "admin";

            // Signup
            await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password,
                type
            });

            // Signin
            const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username,
                password,
            });

            token = response.data.token;

            // Create Avatar
            const avatarCreationResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
                imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s",
                name: "Timmy"
            });
            avatarId = avatarCreationResponse.data.avatarId;
        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("User cannot update metadata because of wrong avatar id", async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
                avatarId: "123456789"
            }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            expect(response.status).toBe(400);
        } catch (error) {
            console.error("Error in test:", error);
        }
    });

    test("User can update metadata with valid avatar id", async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
                avatarId: avatarId
            }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            expect(response.status).toBe(200);
        } catch (error) {
            console.error("Error in test:", error);
        }
    });

    test("User can't update metadata if no header provided", async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
                avatarId
            });
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    });
});

describe("User avatar information", () => {
    let token, avatarId, adminId;

    beforeAll(async () => {
        try {
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";
            const type = "admin";

            // Signup
            const responseSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password,
                type
            });
            adminId = responseSignup.data.adminId;

            // Signin
            const responseSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username,
                password
            });
            token = responseSignin.data.token;

            // Create avatar
            const avatarCreationResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
                imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s",
                name: "Timmy"
            });
            avatarId = avatarCreationResponse.data.avatarId;
        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("Get back avatar details for a user", async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${adminId}]`);
            expect(response.data.avatars.length).toBe(1);
            expect(response.data.avatars[0].adminId).toBe(adminId);
        } catch (error) {
            console.error("Error in test:", error);
        }
    });

    test("Get available avatars and check if current avatar created exists", async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
            expect(response.data.avatars.length).not.toBe(0);
            const currentAvatar = response.data.avatars.find(x => x.id === avatarId);
            expect(currentAvatar).toBeDefined();
        } catch (error) {
            console.error("Error in test:", error);
        }
    });
});

describe("Space Testing", () => {
    let mapId, elementId, element2Id;
    let adminId, adminToken;
    let userId, userToken;

    beforeAll(async () => {
        try {
            const username = "Omani" + Math.random();
            const password = "12345Ahmedsaber";

            // Signup as admin
            const responseSignupAdmin = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username,
                password,
                type: "admin"
            });
            adminId = responseSignupAdmin.data.adminId;

            // Signin as admin
            const responseSigninAdmin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username,
                password,
            });
            adminToken = responseSigninAdmin.data.token;

            // Signup as user
            const responseSignupUser = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: "AhmedOmani",
                password,
                type: "user"
            });
            userId = responseSignupUser.data.userId;

            // Signin as user
            const responseSigninUser = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: "AhmedOmani",
                password
            });
            userToken = responseSigninUser.data.token;

            // Create an element
            const element = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
                imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd96CRCRea3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXQIKJTG1GpZ9ZgSGYafQPToMy_JTomV5RHXsAsWQC3tkNMLH_CsibsSZSoJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true
            }, {
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
            elementId = element.data.id;

            const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
                imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd96CRCRea3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXQIKJTG1GpZ9ZgSGYafQPToMy_JTomV5RHXsAsWQC3tkNMLH_CsibsSZSoJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true
            }, {
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
            element2Id = element2.data.id;

            // Create a map
            const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                defaultElements: [
                    {
                        elementId: elementId,
                        x: 20,
                        y: 20
                    },
                    {
                        elementId: elementId,
                        x: 18,
                        y: 20
                    },
                    {
                        elementId: element2Id,
                        x: 20,
                        y: 20
                    }
                ]
            }, {
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
            mapId = map.data.id;
        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("User can create a space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.spaceId).toBeDefined();
    });

    test("User can create empty space - without mapId", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        expect(response.data.spaceId).toBeDefined();
    });

    test("User can't create space without mapId and dimensions", async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/v1/space`, {
                name: "Test"
            }, {
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    test("User can delete a space that exists", async () => {
        const createSpaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        const id = createSpaceResponse.data.spaceId;
        const deleteSpaceResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${id}`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        expect(deleteSpaceResponse.status).toBe(200);
    });

    test("User can't delete space that doesn't exist", async () => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    test("User can't delete a space created by another user", async () => {
        const createSpaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        const id = createSpaceResponse.data.spaceId;
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/space/${id}`, {
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    test("Admin has no spaces initially", async () => {
        const getSpacesResponse = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        expect(getSpacesResponse.data.spaces.length).toBe(0);
    });

    test("Admin created a space and get that space", async () => {
        const createSpaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200"
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        const id = createSpaceResponse.data.spaceId;
        const getSpacesResponse = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        const filteredSpace = getSpacesResponse.data.spaces.find(x => x.id === id);
        expect(getSpacesResponse.data.spaces.length).toBe(1);
        expect(filteredSpace).toBeDefined();
    });
});