'use client';

import {
  CartsServiceGetCartsUserByIdQueryResult,
  useCartsServiceGetCartsUserById,
  useCartsServicePostCarts,
  useProductsServiceGetProducts,
  useProductsServiceGetProductsById,
} from '../_core/openapi/queries';
import { useAppContext } from '../layout';
import {
  Button,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import { format, isBefore } from 'date-fns';
import { memo, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { DatePicker } from '@mui/x-date-pickers';
import { FormContainer, Modal } from '@bosshire-test/components';
import { cn } from '@bosshire-test/core';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { superstructResolver } from '@hookform/resolvers/superstruct';
import { array, date, min, number, object, Struct } from 'superstruct';
import { ProductsService } from '../_core/openapi/requests/services.gen';
import { useCurrentUser } from './_hooks/useCurrentUser';

interface AddCartPayload {
  userId: number;
  date: Date;
  products: { productId: number; quantity: number }[];
}

const addCartSchema: Struct<AddCartPayload> = object({
  userId: number(),
  date: date(),
  products: array(
    object({
      productId: number(),
      quantity: min(number(), 0),
    })
  ),
});

const ProductDetailModal = memo(function ProductDetailModal({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const { data } = useProductsServiceGetProductsById(
    { id: id ?? 0 },
    undefined,
    {
      enabled: !!id,
    }
  );

  return (
    <Modal open={!!id} onClose={onClose}>
      <div className="w-96 p-4 rounded-2xl flex flex-col gap-1">
        {data?.image && (
          <div className="relative h-36 w-36 border rounded">
            <Image
              src={data.image}
              alt={data.title ?? 'Product'}
              fill
              objectFit="contain"
            />
          </div>
        )}

        <div className="font-semibold line-clamp-2">{data?.title}</div>

        <div className="flex items-center gap-1">
          <Rating defaultValue={data?.rating?.rate} readOnly />

          <span className="text-xs text-gray-500">
            ({data?.rating?.count} reviews)
          </span>
        </div>

        <div className="font-bold">${data?.price}</div>
        <div className="line-clamp-3">{data?.description}</div>
      </div>
    </Modal>
  );
});

const ProductTableRow = memo(function ProductTableRow({
  id,
  qty,
  onClick,
}: {
  id: number;
  qty: number;
  onClick: () => void;
}) {
  const { data, isPending } = useProductsServiceGetProductsById({ id });

  if (isPending) {
    return (
      <TableRow>
        <TableCell>Loading...</TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="flex gap-4">
      <TableCell onClick={onClick} className="cursor-pointer">
        {data?.title}
      </TableCell>
      <TableCell>{qty}</TableCell>
    </TableRow>
  );
});

const CartTable = memo(function CartTable({
  cart,
  onViewProduct,
}: {
  cart: NonNullable<CartsServiceGetCartsUserByIdQueryResult['data']>[0];
  onViewProduct: (id: number | null) => void;
}) {
  const rowsPerPage = 5;
  const [page, setPage] = useState(0);

  const productList = useMemo(() => {
    return cart.products
      ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map(({ productId, quantity }, index) => {
        if (!productId || !quantity) {
          return null;
        }

        return (
          <ProductTableRow
            key={index}
            id={productId}
            qty={quantity}
            onClick={() => onViewProduct(productId)}
          />
        );
      });
  }, [cart.products, page, rowsPerPage, onViewProduct]);

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const emptyRows = useMemo(() => {
    return page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - (cart.products?.length ?? 0))
      : 0;
  }, [page, rowsPerPage, cart.products?.length]);

  return (
    <div>
      <div className="flex gap-4 justify-between items-center">
        <div className="text-xl mb-2">Cart ID: {cart.id}</div>
        <div className="text-xs">
          {cart.date ? format(cart.date, 'dd MMMM yyyy') : '-'}
        </div>
      </div>

      <Table>
        <TableHead className="bg-slate-100">
          <TableRow>
            <TableCell>Product Title</TableCell>
            <TableCell width="10%">Qty</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {productList}

          {!!emptyRows && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={2} />
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={2}
              count={cart.products?.length ?? 0}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              onPageChange={handleChangePage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
});

const AddCartForm = memo(function AddCartForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { toast } = useAppContext();
  const currentDate = useMemo(() => new Date(), []);
  const userId = useCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useProductsServiceGetProducts();

  const defaultValues = async () => {
    const data = await ProductsService.getProducts();

    const products = data.map((product) => ({
      productId: product.id ?? 0,
      quantity: 0,
    }));

    return {
      userId: userId,
      date: currentDate,
      products,
    };
  };

  const formContext = useForm<AddCartPayload>({
    resolver: superstructResolver(addCartSchema),
    defaultValues,
  });
  const { reset } = formContext;

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    reset();
  }, [reset]);

  const { mutate, isPending } = useCartsServicePostCarts({
    onError: (err, newCart, context) => {
      toast('Failed to add cart.', {
        severity: 'error',
      });
    },
    onSuccess: (data) => {
      if (!data.id) {
        toast('Failed to add cart.', {
          severity: 'error',
        });
        return;
      }

      toast('Cart added successfully');
      handleClose();
      onSuccess();
    },
  });

  const onSubmit: SubmitHandler<AddCartPayload> = async ({
    date,
    products,
    ...restInput
  }) => {
    const filteredProducts = products.filter((product) => product.quantity);

    mutate({
      requestBody: {
        date: date.toISOString(),
        products: filteredProducts,
        ...restInput,
      },
    });
  };

  const productList = useMemo(() => {
    return data?.map((product, index) => (
      <div key={product.id}>
        <div className="p-4 rounded border flex flex-col gap-1 text-sm h-full">
          {product?.image && (
            <div className="relative h-28 w-full self-center">
              <Image
                src={product.image}
                alt={product.title ?? 'Product'}
                fill
                objectFit="contain"
              />
            </div>
          )}

          <div className="font-semibold line-clamp-2 mb-auto">
            {product?.title}
          </div>

          <div className="flex items-center gap-1">
            <Rating
              defaultValue={product?.rating?.rate}
              size="small"
              readOnly
            />

            <span className="text-xs text-gray-500">
              ({product?.rating?.count})
            </span>
          </div>

          <div className="font-bold">${product?.price}</div>

          <Controller
            name={`products.${index}.quantity`}
            render={({ field: { onChange, ...restField } }) => (
              <TextField
                {...restField}
                onChange={(event) => {
                  const valInt = event.target.value
                    ? parseInt(event.target.value)
                    : 0;
                  onChange(valInt);
                }}
                type="number"
                size="small"
                slotProps={{ htmlInput: { min: 0 } }}
              />
            )}
          />
        </div>
      </div>
    ));
  }, [data]);

  return (
    <div>
      <div className="flex gap-4 justify-between items-center">
        <div className="text-xl mb-2">New Cart</div>

        <Button onClick={() => setIsModalOpen(true)}>Add Product</Button>
      </div>

      <Table>
        <TableHead className="bg-slate-100">
          <TableRow>
            <TableCell>Product Title</TableCell>
            <TableCell width="10%">Qty</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell colSpan={2}>No products in cart</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Modal open={isModalOpen} onClose={handleClose}>
        <FormContainer formContext={formContext} onSuccess={onSubmit}>
          <div className="overflow-y-auto w-[80vw] h-[80vh]">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {productList}
            </div>
          </div>

          <div className="flex gap-4 justify-between mt-4">
            <Button variant="text" onClick={handleClose}>
              Cancel
            </Button>

            <Button type="submit" variant="contained" loading={isPending}>
              Save
            </Button>
          </div>
        </FormContainer>
      </Modal>
    </div>
  );
});

export default function CartsPage() {
  const userId = useCurrentUser();

  const [daterange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [productIdPayload, setProductIdPayload] = useState<number | null>(null);
  const [isShowForm, setIsShowForm] = useState(false);

  const { data } = useCartsServiceGetCartsUserById(
    {
      id: userId ?? 0,
      startdate: daterange.start
        ? format(daterange.start, 'yyyy-MM-dd')
        : undefined,
      enddate: daterange.end ? format(daterange.end, 'yyyy-MM-dd') : undefined,
    },
    undefined,
    {
      enabled: !!userId,
    }
  );

  const cartList = useMemo(() => {
    if (!data) {
      return [];
    }

    return data
      .slice()
      .sort((a, b) => {
        return (
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
        );
      })
      .map((cart) => {
        return (
          <CartTable
            key={cart.id}
            cart={cart}
            onViewProduct={setProductIdPayload}
          />
        );
      });
  }, [data]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 items-center">
        <DatePicker
          label="Start Date"
          value={daterange.start}
          onChange={(newStart) => {
            const startDate = newStart ?? null;
            const endDate = daterange.end ?? null;

            if (!startDate || !endDate || isBefore(startDate, endDate)) {
              setDateRange((prevValue) => ({ ...prevValue, start: startDate }));
            }

            setDateRange({ start: startDate, end: null });
          }}
          format="dd MMMM yyyy"
          slotProps={{
            textField: {
              readOnly: true,
            },
          }}
        />

        <DatePicker
          label="End Date"
          value={daterange.end}
          minDate={daterange.start ?? undefined}
          onChange={(newEnd) =>
            setDateRange((prevValue) => ({ ...prevValue, end: newEnd }))
          }
          format="dd MMMM yyyy"
          slotProps={{
            textField: {
              readOnly: true,
            },
          }}
        />

        <div className="ml-auto">
          <Button variant="outlined" onClick={() => setIsShowForm(true)}>
            Add New Cart
          </Button>
        </div>
      </div>

      <div className={cn({ hidden: !isShowForm })}>
        <AddCartForm onSuccess={() => setIsShowForm(false)} />
      </div>

      {cartList}

      <ProductDetailModal
        id={productIdPayload}
        onClose={() => setProductIdPayload(null)}
      />
    </div>
  );
}
