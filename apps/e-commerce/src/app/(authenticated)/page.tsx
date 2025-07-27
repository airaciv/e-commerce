'use client';

import { useLocalStorage } from 'react-use';
import {
  CartsServiceGetCartsUserByIdQueryResult,
  useCartsServiceGetCartsUserById,
  useProductsServiceGetProductsById,
} from '../_core/openapi/queries';
import { GlobalStorageKey } from '../layout';
import {
  Rating,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { format, isBefore } from 'date-fns';
import { memo, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { DatePicker } from '@mui/x-date-pickers';
import { Modal } from '@bosshire-test/components';

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
  const { data } = useProductsServiceGetProductsById({ id });

  return (
    <TableRow className="flex gap-4">
      <TableCell onClick={onClick} className="cursor-default">
        {data?.title}
      </TableCell>
      <TableCell>{qty}</TableCell>
    </TableRow>
  );
});

const CartItem = memo(function CartItem({
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

export default function CartsPage() {
  const [userId] = useLocalStorage<number>(GlobalStorageKey.USER_ID);

  const [daterange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [productIdPayload, setProductIdPayload] = useState<number | null>(null);

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
          <CartItem
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
      </div>

      {cartList}

      <ProductDetailModal
        id={productIdPayload}
        onClose={() => setProductIdPayload(null)}
      />
    </div>
  );
}
