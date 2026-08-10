import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
export declare class ExpenseCategoriesService {
    create(createExpenseCategoryDto: CreateExpenseCategoryDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto): string;
    remove(id: number): string;
}
