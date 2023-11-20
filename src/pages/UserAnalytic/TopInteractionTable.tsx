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
import { useNavigate } from "react-router-dom";
import ImageView from "shared/ImageView";
import styles from "./index.module.scss";
import { formatNumber } from "helpers/StringHelper";

interface ITopInteractionTable {
  data: IFCUser[];
}

const TopInteractionTable = ({ data }: ITopInteractionTable) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.fcUser.data);
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
    loginElement?.click();
  }, []);
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
                    navigate(`/insights/${row.fid}`, {
                      state: { goBack: true },
                    });
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
                  <TableCell align="right">
                    {formatNumber(likes) || "-"}
                  </TableCell>
                  <TableCell align="right" padding="none">
                    {formatNumber(replied_casts) || "-"}
                  </TableCell>
                  <TableCell align="right">
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
          Sign in to view more
        </div>
      )}
    </>
  );
};

export default memo(TopInteractionTable);
