// __tests__/userController.test.js

const userController = require('../controllers/users');
const User = require('../models/User');

jest.mock('../models/User'); // Mock the User model

// Mocked response and request
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('User Controller', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return all users', async () => {
            const req = {};
            const res = mockResponse();
            const users = [{ name: 'User1' }, { name: 'User2' }];

            User.find.mockResolvedValue(users);

            await userController.getUsers(req, res, mockNext);

            expect(User.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, count: users.length, data: users });
        });

        it('should handle errors', async () => {
            const req = {};
            const res = mockResponse();

            User.find.mockRejectedValue(new Error('error'));

            await userController.getUsers(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });

    describe('getUser', () => {
        it('should return a single user', async () => {
            const req = { params: { id: '123' } };
            const res = mockResponse();
            const user = { name: 'User1' };

            User.findById.mockResolvedValue(user);

            await userController.getUser(req, res, mockNext);

            expect(User.findById).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
        });

        it('should return 400 if user not found', async () => {
            const req = { params: { id: '123' } };
            const res = mockResponse();

            User.findById.mockResolvedValue(null);

            await userController.getUser(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });

        it('should handle errors', async () => {
            const req = { params: { id: '123' } };
            const res = mockResponse();

            User.findById.mockRejectedValue(new Error('error'));

            await userController.getUser(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });

    describe('updateUserRole', () => {
        it('should update user role successfully', async () => {
            const req = { params: { id: '123' }, body: { role: 'admin' } };
            const res = mockResponse();
            const updatedUser = { name: 'User1', role: 'admin' };

            User.findByIdAndUpdate.mockResolvedValue(updatedUser);

            await userController.updateUserRole(req, res, mockNext);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', { role: 'admin' }, { new: true, runValidators: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedUser });
        });

        it('should return 400 if user not found', async () => {
            const req = { params: { id: '123' }, body: { role: 'admin' } };
            const res = mockResponse();

            User.findByIdAndUpdate.mockResolvedValue(null);

            await userController.updateUserRole(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });

        it('should handle errors', async () => {
            const req = { params: { id: '123' }, body: { role: 'admin' } };
            const res = mockResponse();

            User.findByIdAndUpdate.mockRejectedValue(new Error('error'));

            await userController.updateUserRole(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });

});
