const fs = require('fs');
const file = 'D:/Pos-Nasa Fresh Mart/backend/src/users/users.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ Injectable \} from '@nestjs\/common';/, "import { Injectable, ConflictException } from '@nestjs/common';");

// createUser replace
const oldCreateUser =   async createUser(data: any) {
    const { username, password, name, roleId } = data;
    return this.prisma.user.create({
      data: {
        username,
        password,
        name,
        roleId,
      },
    });
  };
const newCreateUser =   async createUser(data: any) {
    const { username, password, name, roleId } = data;
    try {
      return await this.prisma.user.create({
        data: {
          username,
          password,
          name,
          roleId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  };
content = content.replace(oldCreateUser, newCreateUser);

// updateUser replace
const oldUpdateUser =   async updateUser(id: number, data: any) {
    const updateData: any = { ...data };
    if (updateData.password) {
      // Password hashing should ideally be in a service that calls this, but we'll let controller handle it or do it here
      // For safety, remove it if it's empty
      if (updateData.password.trim() === '') {
        delete updateData.password;
      }
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  };
const newUpdateUser =   async updateUser(id: number, data: any) {
    const updateData: any = { ...data };
    if (updateData.password) {
      if (updateData.password.trim() === '') {
        delete updateData.password;
      }
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  };
content = content.replace(oldUpdateUser, newUpdateUser);

fs.writeFileSync(file, content, 'utf8');
console.log('Pos UsersService updated');
