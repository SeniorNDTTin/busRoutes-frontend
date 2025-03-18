import { useEffect, useState } from "react";
import { message, Spin, Table } from "antd";

import IMonthTicketPrice from "../../interfaces/monthTicketPrice.ts";
import IOneWayTicketPrice from "../../interfaces/OneWayTicketPrices.ts";
import IBusRoute from "../../interfaces/busRoute.ts";

import monthTicketPriceService from "../../services/monthTicketPrice.service.ts";
import oneWayTicketPriceService from "../../services/oneWayTicketPrices.service.ts";
import busRouteService from "../../services/busRoute.service.ts";

import Header from "../../partials/header/index.tsx";
import Footer from "../../partials/footer/index.tsx";

import "./main.css";

/**
 * Hàm nhóm vé lượt theo các giá trị km distinct.
 * Ví dụ: nếu có vé với maxKilometer: 10, 20, 30, ta sẽ tạo ra các khoảng:
 * 0-10, 10-20, 20-30 với unitPrice của vé tương ứng.
 */
function groupTicketsByDistinctKm(tickets: IOneWayTicketPrice[]): { range: string; unitPrice: number }[] {
  const distinctKmSet = new Set<number>();
  tickets.forEach(ticket => distinctKmSet.add(ticket.maxKilometer));
  const distinctKmArray = Array.from(distinctKmSet).sort((a, b) => a - b);

  const result: { range: string; unitPrice: number }[] = [];
  let previous = 0;
  distinctKmArray.forEach(km => {
    // Tìm vé có maxKilometer = km (giả sử giá của vé này áp dụng cho khoảng previous-km)
    const ticketForKm = tickets.find(ticket => ticket.maxKilometer === km);
    if (ticketForKm) {
      result.push({ range: `${previous} - ${km} km`, unitPrice: ticketForKm.unitPrice });
    }
    previous = km;
  });
  return result;
}

function TicketPrice() {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMonthTickets, setCurrentMonthTickets] = useState<IMonthTicketPrice[]>([]);
  const [upcomingMonthTickets, setUpcomingMonthTickets] = useState<IMonthTicketPrice[]>([]);
  const [oneWayTicketPrices, setOneWayTicketPrices] = useState<IOneWayTicketPrice[]>([]);
  const [busRoutes, setBusRoutes] = useState<IBusRoute[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketPrices = async () => {
      try {
        const [responseMonth, responseOneWay, responseRoutes] = await Promise.all([
          monthTicketPriceService.get(),
          oneWayTicketPriceService.get(),
          busRouteService.get()
        ]);

        // Lưu dữ liệu tuyến vào biến cục bộ để sắp xếp
        const localRoutes: IBusRoute[] = responseRoutes?.data || [];
        setBusRoutes(localRoutes);

        // Hàm cục bộ lấy tên tuyến dựa trên localRoutes
        const getLocalRouteName = (busRouteId: string) => {
          const route = localRoutes.find(route => route._id === busRouteId);
          return route ? route.name : "Không xác định";
        };

        // Lấy thời điểm hiện tại
        const currentTime = new Date();

        // Xử lý vé tháng
        if (responseMonth?.data) {
          const allMonthTickets = responseMonth.data as IMonthTicketPrice[];

          // Nhóm vé tháng theo từng tuyến
          const ticketsByRoute: { [key: string]: IMonthTicketPrice[] } = allMonthTickets.reduce(
            (acc, ticket) => {
              if (!acc[ticket.busRouteId]) {
                acc[ticket.busRouteId] = [];
              }
              acc[ticket.busRouteId].push(ticket);
              return acc;
            },
            {} as { [key: string]: IMonthTicketPrice[] }
          );

          const finalCurrentTickets: IMonthTicketPrice[] = [];
          const finalUpcomingTickets: IMonthTicketPrice[] = [];

          // Đặt mốc thời gian: ví dụ sử dụng ngày 15 của tháng sau
          const thresholdDate = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 15);

          // Với từng tuyến, kiểm tra vé hiện hành và vé sắp áp dụng
          Object.keys(ticketsByRoute).forEach(routeId => {
            const group = ticketsByRoute[routeId];
            // Sắp xếp theo thời gian bắt đầu
            group.sort(
              (a, b) =>
                new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
            );

            // Tìm vé hiện hành 
            const currentTicket = group.find(ticket => {
              const startTime = new Date(ticket.timeStart);
              const endTime = new Date(ticket.timeEnd);
              return currentTime >= startTime && currentTime <= endTime;
            });

            if (currentTicket) {
              finalCurrentTickets.push(currentTicket);
              // Kiểm tra xem vé hiện hành có áp dụng cho "tháng sau" hay không
              const currentEnd = new Date(currentTicket.timeEnd);
              if (currentEnd < thresholdDate) {
                // Nếu không áp dụng cho tháng sau, lấy vé sắp áp dụng có timeStart gần nhất sau thresholdDate
                const upcomingTicket = group
                  .filter(ticket => new Date(ticket.timeStart) >= thresholdDate)
                  .sort(
                    (a, b) =>
                      new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
                  )[0];
                if (upcomingTicket) {
                  finalUpcomingTickets.push(upcomingTicket);
                }
              }
            } else {
              // Nếu không có vé hiện hành, lấy vé sắp áp dụng đầu tiên sau thresholdDate
              const upcomingTicket = group
                .filter(ticket => new Date(ticket.timeStart) >= thresholdDate)
                .sort(
                  (a, b) =>
                    new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
                )[0];
              if (upcomingTicket) {
                finalUpcomingTickets.push(upcomingTicket);
              }
            }
          });

          // Sắp xếp vé theo tên tuyến để hiển thị
          finalCurrentTickets.sort((a, b) => {
            const routeA = getLocalRouteName(a.busRouteId);
            const routeB = getLocalRouteName(b.busRouteId);
            return routeA.localeCompare(routeB);
          });
          finalUpcomingTickets.sort((a, b) => {
            const routeA = getLocalRouteName(a.busRouteId);
            const routeB = getLocalRouteName(b.busRouteId);
            return routeA.localeCompare(routeB);
          });

          setCurrentMonthTickets(finalCurrentTickets);
          setUpcomingMonthTickets(finalUpcomingTickets);
        } else {
          message.warning("Không có dữ liệu giá vé tháng.");
        }

        // Xử lý vé lượt
        if (responseOneWay?.data) {
          setOneWayTicketPrices(responseOneWay.data.data);
        } else {
          message.warning("Không có dữ liệu giá vé lượt.");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Lỗi khi tải dữ liệu giá vé.");
        message.error("Lỗi khi tải dữ liệu giá vé.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketPrices();
  }, []);

  // Hàm lấy tên tuyến từ state busRoutes
  const getRouteName = (busRouteId: string) => {
    const route = busRoutes.find(route => route._id === busRouteId);
    return route ? route.name : "Không xác định";
  };

  // Cột của bảng vé tháng
  const monthColumns = [
    {
      title: "Tuyến",
      dataIndex: "busRouteId",
      key: "busRouteId",
      render: getRouteName
    },
    {
      title: "Giá vé/Tháng",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`
    },
    {
      title: "TG áp dụng",
      dataIndex: "timeStart-timeEnd",
      key: "timeStart-timeEnd",
      render: (_: any, record: IMonthTicketPrice) => {
        const { timeStart, timeEnd } = record;
        if (!timeStart || !timeEnd) return "Chưa xác định";

        const startDate = new Date(timeStart);
        const endDate = new Date(timeEnd);

        const sameYear = startDate.getFullYear() === endDate.getFullYear();
        if (sameYear) {
          // Nếu cùng năm, hiển thị: "dd/MM - dd/MM/yyyy"
          const startStr = startDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
          const endStr = endDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
          return `${startStr} - ${endStr}`;
        } else {
          // Nếu khác năm, hiển thị đầy đủ: "dd/MM/yyyy - dd/MM/yyyy"
          const optionsFull: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
          const startStr = startDate.toLocaleDateString("vi-VN", optionsFull);
          const endStr = endDate.toLocaleDateString("vi-VN", optionsFull);
          return `${startStr} - ${endStr}`;
        }
      }
    }
  ];

  // Cột của bảng vé lượt (group theo khoảng km)
  const kmRangeColumns = [
    { title: "Khoảng cách", dataIndex: "range", key: "range" },
    {
      title: "Giá vé/Km",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`
    }
  ];

  // Nhóm vé lượt theo từng tuyến
  const groupedOneWayTickets = oneWayTicketPrices.reduce(
    (groups: { [key: string]: IOneWayTicketPrice[] }, ticket) => {
      const routeId = ticket.busRouteId;
      if (!groups[routeId]) {
        groups[routeId] = [];
      }
      groups[routeId].push(ticket);
      return groups;
    },
    {}
  );

  // Sắp xếp các tuyến theo tên
  const distinctRouteIds = Object.keys(groupedOneWayTickets).sort((a, b) =>
    getRouteName(a).localeCompare(getRouteName(b))
  );

  return (
    <>
      <Header />
      <main className="ticket-price-container">
        <h1 className="home-title">GIÁ VÉ XE BUS</h1>
        {loading ? (
          <div className="loading">
            <Spin size="large" />
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div>
            {/* Bảng vé tháng */}
            <h3 className="table-title">Giá vé tháng</h3>
            <div className="monthly-tickets-panel">
              {/* Vé tháng hiện hành */}
              <div className="table-wrapper">
                <h4 className="table-subtitle">Hiện hành</h4>
                {currentMonthTickets.length > 0 ? (
                  <Table
                    dataSource={currentMonthTickets}
                    columns={monthColumns}
                    rowKey="_id"
                    pagination={false}
                    className="styled-table"
                  />
                ) : (
                  <p>Không có giá vé hiện hành</p>
                )}
              </div>

              {/* Vé tháng sắp áp dụng */}
              <div className="table-wrapper">
                <h4 className="table-subtitle">Sắp áp dụng</h4>
                {upcomingMonthTickets.length > 0 ? (
                  <Table
                    dataSource={upcomingMonthTickets}
                    columns={monthColumns}
                    rowKey="_id"
                    pagination={false}
                    className="styled-table"
                  />
                ) : (
                  <p>Không có giá vé sắp áp dụng</p>
                )}
              </div>
            </div>

            {/* Vé lượt hiển thị theo tuyến, sau đó group theo khoảng km */}
            <h3 className="table-title">Giá vé lượt theo tuyến</h3>
            <div className="ticket-tables">
              {distinctRouteIds.map((routeId) => {
                // Lấy tất cả vé của tuyến
                const ticketsForRoute = groupedOneWayTickets[routeId];
                // Nhóm theo khoảng km
                const kmGroupedTickets = groupTicketsByDistinctKm(ticketsForRoute);

                return (
                  <div key={routeId} className="table-wrapper">
                    <h3 className="table-title">{getRouteName(routeId)}</h3>
                    <Table
                      dataSource={kmGroupedTickets}
                      columns={kmRangeColumns}
                      rowKey="range"
                      pagination={false}
                      className="styled-table"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default TicketPrice;
