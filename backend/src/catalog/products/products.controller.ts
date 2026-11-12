import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CREATE_PRODUCT permission.',
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('CREATE_PRODUCT')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({
    summary: 'Retrieve all products (with filters and pagination)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of products.',
  })
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  findAll(@Query() filterDto: GetProductsFilterDto) {
    return this.productsService.findAll(filterDto, false);
  }

  @ApiOperation({ summary: 'Retrieve a single product by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the product',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Returns the product details.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id, false);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the product',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires UPDATE_PRODUCT permission.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('UPDATE_PRODUCT')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the product',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires DELETE_PRODUCT permission.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('DELETE_PRODUCT')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
