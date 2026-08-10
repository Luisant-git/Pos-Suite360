import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
export declare class ExpenseCategoriesController {
    private readonly expenseCategoriesService;
    constructor(expenseCategoriesService: ExpenseCategoriesService);
    create(createExpenseCategoryDto: CreateExpenseCategoryDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateExpenseCategoryDto: UpdateExpenseCategoryDto): string;
    remove(id: string): string;
}
