import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { interactionHeads, sortDataInteraction } from "helpers/TableHelper";
import useAppSelector from "hooks/useAppSelector";
import { IFCUser } from "models/FC";
import React, { memo, useCallback, useMemo } from "react";
import ImageView from "shared/ImageView";
import styles from "./index.module.scss";
import { formatNumber } from "helpers/StringHelper";
import IconLike from "shared/SVG/FC/IconLike";
import IconReply from "shared/SVG/FC/IconReply";
import IconRecast from "shared/SVG/FC/IconRecast";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_USER_ACTIONS } from "reducers/FCUserReducers";
import { usePathname, useRouter } from "next/navigation";

interface ITopInteractionTable {
  data: IFCUser[];
}

const TopInteractionTable = ({ data }: ITopInteractionTable) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.fcUser.data);
  const pathname = usePathname();
  const isPlugin = useMemo(
    () => pathname.includes("/plugin-fc/insights"),
    [pathname]
  );
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = React.useState<string>("total");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );
  const emptyRows = useMemo(
    () => (page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0),
    [data.length, page, rowsPerPage]
  );

  const visibleRows = useMemo(
    () =>
      sortDataInteraction(data, order, orderBy).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [data, order, orderBy, page, rowsPerPage]
  );
  const onLoginClick = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    dispatch(FC_USER_ACTIONS.updateLoginSource("View Top Interaction"));
    loginElement?.click();
  }, [dispatch]);
  return (
    <>
      <TableContainer>
        <Table aria-labelledby="topInteractionTable" size={"medium"}>
          <TableHead>
            <TableRow>
              {interactionHeads.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  padding={headCell.disablePadding ? "none" : "normal"}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => {
                        const isDesc =
                          orderBy === headCell.id && order === "desc";
                        setOrder(isDesc ? "asc" : "desc");
                        setOrderBy(headCell.id);
                      }}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => {
              const { likes, replied_casts, recasts } = row.reaction_data || {};
              const total =
                (likes || 0) + (replied_casts || 0) + (recasts || 0);
              return (
                <TableRow
                  hover
                  onClick={(event) => {
                    if (isPlugin) {
                      window.open(`/insights/${row.username}`, "_blank");
                    } else {
                      router.push(`/insights/${row.username}`);
                    }
                  }}
                  key={row.fid}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell component="th" scope="row" padding="none">
                    #{index + 1 + page * rowsPerPage}
                  </TableCell>
                  <TableCell align="left" padding="none">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <ImageView
                        alt="avatar"
                        src={row.pfp?.url}
                        style={{
                          width: 30,
                          height: 30,
                          minWidth: 30,
                          borderRadius: "50%",
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--color-primary-text)",
                            lineHeight: "19px",
                            whiteSpace: "nowrap",
                            maxWidth: 150,
                          }}
                          className="truncate"
                        >
                          {row.display_name}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--color-mute-text)",
                            lineHeight: "17px",
                            whiteSpace: "nowrap",
                            maxWidth: 150,
                          }}
                          className="truncate"
                        >
                          @{row.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <IconLike
                      style={{ marginBottom: 2, marginRight: 6 }}
                      size={12}
                    />
                    {formatNumber(likes) || "-"}
                  </TableCell>
                  <TableCell padding="none">
                    <IconReply size={12} style={{ marginRight: 6 }} />
                    {formatNumber(replied_casts) || "-"}
                  </TableCell>
                  <TableCell>
                    <IconRecast
                      style={{ marginBottom: 2, marginRight: 6 }}
                      size={12}
                    />
                    {formatNumber(recasts) || "-"}
                  </TableCell>
                  <TableCell align="right" padding="none">
                    {formatNumber(total) || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 53 * emptyRows,
                }}
              >
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {user?.fid ? (
        <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : (
        <div className={styles["sign-in-to-view"]} onClick={onLoginClick}>
          Login to view more
        </div>
      )}
    </>
  );
};

export default memo(TopInteractionTable);
