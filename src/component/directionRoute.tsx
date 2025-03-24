
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from '../assets/css/index/findRouteDetail.module.scss';
import IDirection from '../interfaces/direction';
import IBusRoute from '../interfaces/busRoute';
import IBusRouteDetail from '../interfaces/busRouteDetail';
import IBusStop from '../interfaces/busStop';

interface Props {
  routeData: IBusRoute;
  busRouteDetail: IBusRouteDetail[];
  busAllStop: IBusStop[];
  direction: IDirection[]
  backIndex: () => void;
}

const DirectionRoute = ({ routeData, busRouteDetail, busAllStop, direction, backIndex } : Props) => {
    const formatCurrency= (value? : number) => {
        if(!value) return '0';
         return new Intl.NumberFormat("vi-VN").format(value)
    }
  const getStopsForDirection = (directionId: string) => {
    return busRouteDetail
      .filter((detail) => detail.directionId === directionId && detail.busRouteId === routeData._id)
      .map((detail) => busAllStop.find((stop) => stop._id === detail.busStopId))
      .filter(Boolean);
  };

  return (
    <div>
      <Button onClick={backIndex}>
        <ArrowLeftOutlined />
      </Button>

      <div className={styles.detailRoute}>
        <p style={{ color: 'red', fontWeight: 'bold' }}>{routeData.name}</p>
        <p>
          <strong>Độ dài tổng:</strong> {routeData.fullDistance} Km
        </p>
        <p>
          <strong>Giá vé:</strong> {formatCurrency(routeData.fullPrice)} VND
        </p>
        <p>
          <strong>Thời gian tuyến:</strong> {routeData.time}
        </p>
        <p>
          <strong>TGBD chuyến đầu:</strong> {routeData.firstFlightStartTime}
        </p>
        <p>
          <strong>TGBD chuyến cuối:</strong> {routeData.lastFlightStartTime}
        </p>
        <p>
          <strong>Giãn cách tuyến:</strong> {routeData.timeBetweenTwoFlight}
        </p>

        {direction.length > 0 ? (
          <>
            <div>
              {direction.map((dir) => {
                if (dir.description === 'Lượt đi' || dir.description === 'Lượt về') {
                  const directionId = dir._id;
                  const stops = getStopsForDirection(directionId);

                  return (
                    <p key={directionId}>
                      <strong className={dir.description === 'Lượt đi' ? styles.direction : styles.directionReturn}>
                        {dir.description}:
                      </strong>
                      {stops.map((stop, index) => `( ${index + 1} ) ${stop?.name}`).join(' ---> ')}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </>
        ) : (
          <p>Không có dữ liệu về lộ trình.</p>
        )}
      </div>
    </div>
  );
};

export default DirectionRoute;
