const axios2 = require("axios") ;

const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

const axios = {
    post: async(...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    get: async(...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    delete: async(...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    put: async(...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch(e) {
            return e.response
        }
    }
}

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
            expect(response.status).toBe(201);

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
                password,
                type: "user"
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
                password,
                type: "user"
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
                password,
                type: "user"
            });
            await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: "WrongUsername",
                password
            });
        } catch (error) {
            expect(error.response.status).toBe(400); // Unauthorized
        }
    });
});

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
            }, {
                headers:{
                    authorization: `Bearer ${token}`
                }
            });
            avatarId = avatarCreationResponse.data.id;
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
            if (error.response) {
                expect(error.response.status).toBe(400);
            } else {
                console.log("Unexp err" , error);
            }
        }
    });

    test("User can update metadata with valid avatar id", async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata` , {
                avatarId: avatarId
            } , {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
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
 
            adminId = responseSignup.data.userId;

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
            } , {
                headers : {
                    authorization: `Bearer ${token}`
                }
            });
            avatarId = avatarCreationResponse.data.id;

        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("Get back avatar details for a user", async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${adminId}]`);
            expect(response.data.avatars.length).toBe(1);
            expect(response.data.avatars[0].userId).toBe(adminId);
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
            // Add error handling and response validation for each request
            const username = "AhmedOmaniiii" + Math.floor(Math.random() * 10000);
            const password = "12345Ahmedsaber";

            // Signup as admin
            const responseSignupAdmin = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: username,
                password: password,
                type: "admin"
            });
            adminId = responseSignupAdmin.data.userId;

            // Signin as admin
            const responseSigninAdmin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: username,
                password: password,
            });
            adminToken = responseSigninAdmin.data.token;
   
            // Signup as user with unique username
            const userUsername = "AhmedOmani" + Math.floor(Math.random() * 10000);
            const responseSignupUser = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: userUsername,
                password,
                type: "user"  // Changed from "user" to match case
            });
            userId = responseSignupUser.data.userId;
            // Signin as user
            const responseSigninUser = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: userUsername,  // Use the unique username
                password
            });
            userToken = responseSigninUser.data.token;

            // Create elements with proper error handling
            const element = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
                imageUrl: "https://example.com/image.jpg",  // Changed to simpler URL
                width: 1,
                height: 1,
                static: true
            }, {
                headers: { authorization: `Bearer ${adminToken}` }
            });
            elementId = element.data.id;

            const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
                imageUrl: "https://example.com/image2.jpg",
                width: 1,
                height: 1,
                static: true
            }, {
                headers: { authorization: `Bearer ${adminToken}` }
            });
            element2Id = element2.data.id;

            // Create map with proper error handling
            const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
                thumbnail: "https://example.com/thumbnail.png",
                dimensions: "100x200",
                name: "Omaniiiii map",
                defaultElements: [
                    { elementId, x: 20, y: 20 },
                    { elementId, x: 18, y: 20 },
                    { elementId, x: 20, y: 20 }
                ]
            }, {
                headers: { authorization: `Bearer ${adminToken}` }
            });
            mapId = map.data.id;

        } catch (error) {
            console.error("Error during setup:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error; // Re-throw to fail tests immediately
        }
    });

    test("User can create a space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId,
            userId: userId
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
            dimensions: "100x200",
            mapId: ""
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
            dimensions: "100x200",
            mapId: ""
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
            dimensions: "100x200",
            mapId: ""
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

describe("Arena endpoints", () => {
    let mapId, elementId, element2Id;
    let adminId, adminToken;
    let userId, userToken;
    let spaceId;

    beforeAll(async () => {
        try {
            const randomSuffix = Math.floor(Math.random() * 10000);
            const adminUsername = `Admin${randomSuffix}`;
            const userUsername = `User${randomSuffix}`;
            const password = "12345Ahmedsaber";

            // Signup as admin
            const responseSignupAdmin = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: adminUsername,
                password,
                type: "admin"
            });
            adminId = responseSignupAdmin.data.adminId;

            // Signin as admin
            const responseSigninAdmin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: adminUsername,
                password,
            });
            adminToken = responseSigninAdmin.data.token;

            // Signup as user
            const responseSignupUser = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: userUsername,
                password,
                type: "user"
            });
            userId = responseSignupUser.data.userId;

            // Signin as user
            const responseSigninUser = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: userUsername,
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
                name: "Omaniii map",
                defaultElements: [
                    { elementId: elementId, x: 20, y: 20 },
                    { elementId: elementId, x: 18, y: 20 },
                    { elementId: element2Id, x: 20, y: 20 }
                ]
            }, {
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
            mapId = map.data.id;

            // Create a space
            const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
                name: "test",
                dimensions: "100x200",
                mapId: mapId
            }, {
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });
            spaceId = space.data.spaceId

        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("Incorrect spaceId returns a 400", async () => {
        try {
            await axios.get(`${BACKEND_URL}/api/v1/space/12345`, {
                headers: { authorization: `Bearer ${userToken}` }
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    test("Correct spaceId returns all elements of the space", async () => {      
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` }
        });
        expect(response.status).toBe(200);
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(3);
    });

    test("Delete endpoint is able to delete an element", async () => {
 
        const spaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` }
        });

        const elementToDelete = spaceResponse.data.elements[0]?.id;
        if (!elementToDelete) throw new Error("No elements found in the space");

        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            headers: { 
                authorization: `Bearer ${userToken}` 
            },
            data : {
                id: elementToDelete
            }
        });


        const spaceResponseAfterDeletion = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` }
        });
     
        expect(spaceResponseAfterDeletion.data.dimensions).toBe("100x200");
        expect(spaceResponseAfterDeletion.data.elements.length).toBe(2);
    });
    
    test("Adding an element fails if the element lies outside the dimensions", async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
                elementId,
                spaceId,
                x: 10000,
                y: 10000
            }, {
                headers: { authorization: `Bearer ${userToken}` }
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    test("Adding element to the space works fine", async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            elementId,
            spaceId,
            x: 50,
            y: 20
        }, {
            headers: { authorization: `Bearer ${userToken}` }
        });
        response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` }
        });
        expect(response.data.elements.length).toBe(3);
    });
});

describe("Admin endpoints" , () => {
    let adminId, adminToken;
    let userId, userToken;

    beforeAll(async () => {
        try {
            const randomSuffix = Math.floor(Math.random() * 10000);
            const adminUsername = `Admin${randomSuffix}`;
            const userUsername = `User${randomSuffix}`;
            const password = "12345Ahmedsaber";

            // Signup as admin
            const responseSignupAdmin = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: adminUsername,
                password,
                type: "admin"
            });
            adminId = responseSignupAdmin.data.adminId;

            // Signin as admin
            const responseSigninAdmin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: adminUsername,
                password,
            });
            adminToken = responseSigninAdmin.data.token;

            // Signup as user
            const responseSignupUser = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                username: userUsername,
                password,
                type: "user"
            });
            userId = responseSignupUser.data.userId;

            // Signin as user
            const responseSigninUser = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                username: userUsername,
                password
            });
            userToken = responseSigninUser.data.token;

        } catch (error) {
            console.error("Error during setup:", error);
        }
    });

    test("User cant access admin endpoints" , async () => {
        // Create an element
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd96CRCRea3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXQIKJTG1GpZ9ZgSGYafQPToMy_JTomV5RHXsAsWQC3tkNMLH_CsibsSZSoJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        // Create a map
        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            defaultElements: []
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        // Creatr an avatar
        const avatarCreationResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s",
            name: "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        // Update element 
        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/1` , {
            imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s"
        } , {
            headers : {
                authorization : `Bearer ${userToken}`
            }
        });
        expect(element1Response.status).toBe(403);
        expect(mapResponse.status).toBe(403);
        expect(avatarCreationResponse.status).toBe(403);
        expect(updateElementResponse.status).toBe(403) ;
    });

    test("Admin can access admin endpoints" , async () => {
        // Create an element
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd96CRCRea3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXQIKJTG1GpZ9ZgSGYafQPToMy_JTomV5RHXsAsWQC3tkNMLH_CsibsSZSoJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        // Create a map
        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            defaultElements: []
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        // Creatr an avatar
        const avatarCreationResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s",
            name: "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        // Update element 
        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/1` , {
            imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s"
        } , {
            headers : {
                authorization : `Bearer ${adminToken}`
            }
        });
        expect(element1Response.status).toBe(200);
        expect(mapResponse.status).toBe(200);
        expect(avatarCreationResponse.status).toBe(200);
        expect(updateElementResponse.status).toBe(200) ;
    });

    test("Admin can update the imageUrl for an element" , async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd96CRCRea3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXQIKJTG1GpZ9ZgSGYafQPToMy_JTomV5RHXsAsWQC3tkNMLH_CsibsSZSoJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}` , {
            imageURL: "https://encrypted-ibn0.gstatic.com/images?q=ibn:ANd9GcQm3RFDZW21teuCMFYx_AROjt-AzlwDBROFww&s"
        } , {
            headers : {
                authorization : `Bearer ${adminToken}`
            }
        });
        expect(updateElementResponse.status).toBe(200);
    });
}); 

describe("Websocket tests" , () => {
    let adminToken , adminId ;
    let userToken , userId ;
    let mapId, elementId, element2Id , spaceId;
    let ws , ws2;
    let wsMessages = [] , ws2Messages = [] ;
    let adminX , adminY ;
    let userX , userY ;

    async function waitForAndPopLatestMessages(messageArray) {
        return new Promise(r => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift());
            } else {
                let interval = setTimeout(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift());
                        clearInterval(interval);
                    } 
                }, 100);
            }
        });
    }

    async function setupHTTP()  {
        const randomSuffix = Math.floor(Math.random() * 10000);
        const adminUsername = `Admin${randomSuffix}`;
        const userUsername = `User${randomSuffix}`;
        const password = "12345Ahmedsaber";

        // Signup as admin
        const responseSignupAdmin = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: adminUsername,
            password,
            type: "admin"
        });
        adminId = responseSignupAdmin.data.adminId;

        // Signin as admin
        const responseSigninAdmin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: adminUsername,
            password,
        });
        adminToken = responseSigninAdmin.data.token;

        // Signup as user1
        const responseSignupUser = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: userUsername,
            password,
            type: "user"
        });
        userId = responseSignupUser.data.userId;

        // Signin as user1
        const responseSigninUser = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: userUsername,
            password
        });
        userToken = responseSigninUser.data.token; 

        // Create elements
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
                { elementId: elementId, x: 20, y: 20 },
                { elementId: elementId, x: 18, y: 20 },
                { elementId: element2Id, x: 20, y: 20 }
            ]
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        mapId = map.data.id;

        // Create a space
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        spaceId = space.data.id;
        
    }

    async function setupWebSockets() {
        ws = new WebSocket(WS_URL);
        await new Promise(r => {
            ws.onopen = r
        });
        ws.onmessage = (event) => {
            wsMessages.push(JSON.parse(event.data)) ;
        }

        ws2 = new WebSocket(WS_URL);
        await new Promise(r => {
            ws2.onopen = r
        });
        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data)) ;
        }

    }

    beforeAll(async () => {
        setupHTTP() ;
        setupWebSockets() ;
    });

    test("Get back ack for joining a space" , async () => {
        ws.send(JSON.stringify({
            "type" : "join" ,
            "payload" : {
                "spaceId" : spaceId,
                "token" : adminToken 
            } 
        }));
        const message = await waitForAndPopLatestMessages(wsMessages);

        ws2.send(JSON.stringify({
            "type" : "join" ,
            "payload" : {
                "spaceId" : spaceId,
                "token" : userToken 
            } 
        }));
        const message2 = await waitForAndPopLatestMessages(ws2Messages);
        
        const message3 = await waitForAndPopLatestMessages(wsMessages) ;

        expect(message.type).toBe("space-joined") ;
        expect(message2.type).toBe("space-joined") ;

        expect(message.payload.users.length ).toBe(0) ;
        expect(message2.payload.users.length).toBe(1) ;

        expect(message3.type).toBe("user-join");
        expect(message3.payload.userId).toBe(userId);
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);

        adminX = message.payload.spawn.x;
        adminY = message.payload.spawn.y;

        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;
    });

    test("User cant move across the boundry of the wall" , async () => {
        ws1.send(JSON.stringify({
            type: "movement" ,
            payload : {
                x : 100000 ,
                y : 2000000
            }
        }));
        const message = await waitForAndPopLatestMessages(wsMessages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    });

    test("User cant move to two blocks at the same time" , async () => {
        ws1.send(JSON.stringify({
            type: "movement" ,
            payload : {
                x : adminX + 2 ,
                y : adminY 
            }
        }));
        const message = await waitForAndPopLatestMessages(wsMessages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    });

    test("Correct movement should be broadcasted to the other sockets in the room" , async () => {
        ws1.send(JSON.stringify({
            type: "movement" ,
            payload : {
                x : adminX + 2 ,
                y : adminY ,
                userId : adminId
            }
        }));
        const message = await waitForAndPopLatestMessages(ws2Messages);
        expect(message.type).toBe("movement") ;
        expect(message.payload.x).toBe(adminX + 1);
        expect(message.payload.y).toBe(adminY);
    }); 

    test("If a user leaves , the other user receives a leave event", async () => {
        ws.close() ;
        const message = await waitForAndPopLatestMessages(ws2Messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(adminUserId);    
    });

});