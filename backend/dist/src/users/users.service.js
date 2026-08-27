"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(username) {
        return this.prisma.user.findUnique({
            where: { username },
            include: { role: true },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: { role: true },
        });
    }
    async create(username, pass) {
        let role = await this.prisma.role.findFirst();
        if (!role) {
            role = await this.prisma.role.create({
                data: { name: 'Admin', permissions: ['ALL'] }
            });
        }
        return this.prisma.user.upsert({
            where: { username },
            update: {
                password: pass,
                roleId: role.id,
            },
            create: {
                username,
                password: pass,
                name: username,
                roleId: role.id,
            },
            include: { role: true },
        });
    }
    async createUser(data) {
        const { username, password, name, roleId } = data;
        return this.prisma.user.create({
            data: {
                username,
                password,
                name,
                roleId,
            },
        });
    }
    async updatePassword(userId, hash) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hash },
        });
    }
    async updateUser(id, data) {
        const updateData = { ...data };
        if (updateData.password) {
            if (updateData.password.trim() === '') {
                delete updateData.password;
            }
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteUser(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map