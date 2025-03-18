import React, { useEffect, useState } from "react";import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Select, DatePicker, Button, Card, Steps, message, Modal } from "antd";
import { useWatch } from "antd/es/form/Form";
import busRouteService from "../../services/busRoute.service";
import customerService from "../../services/customer.service.ts";
import monthTicketPriceService from "../../services/monthTicketPrice.service";
import monthTicketService from "../../services/monthTicket.service.ts";
import emailjs from 'emailjs-com'; // Import EmailJS
import IBusRoute from "../../interfaces/busRoute";
import IMonthTicket from "../../interfaces/monthTicket";
import ICustomer from "../../interfaces/customer";
import IMonthTicketPrice from "../../interfaces/monthTicketPrice";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from 'html2canvas'; // For capturing ticket as image
import "./main.css";

dayjs.extend(isBetween);

const { Option } = Select;
const { Step } = Steps;

// EmailJS configuration - replace with your actual credentials
const EMAILJS_SERVICE_ID = 'service_664ht1e';
const EMAILJS_TEMPLATE_ID = 'template_8j6zuwl';
const EMAILJS_USER_ID = 'l5RQf3Ygse2YyqZ1w';

const RegisterTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [busRoute, setBusRoute] = useState<IBusRoute | null>(null);
  const [monthTicketPrice, setMonthTicketPrice] = useState<IMonthTicketPrice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [monthTicketData, setMonthTicketData] = useState<IMonthTicket | null>(null);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [ticketRef] = useState<React.RefObject<HTMLDivElement>>(React.createRef());
  const [form] = Form.useForm();

  const quantity = useWatch("quantity", form);
  const checkEmailDuplicate = async (_: any, value: string) => {
    if (!value) return Promise.resolve();
    try {
      const response = await customerService.findByEmail(value);
      if (response.code === 200 && response.data) {
        return Promise.reject(new Error("Email đã được sử dụng.Vui lòng chọn email khác"));
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error("Lỗi khi kiểm tra email. Vui lòng thử lại."));
    }
  };
  
  const checkPhoneDuplicate = async (_: any, value: string) => {
    if (!value) return Promise.resolve();
    try {
      const response = await customerService.findByPhone(value);
      if (response.code === 200 && response.data) {
        return Promise.reject(new Error("Số điện thoại đã được sử dụng.Vui lòng chọn số điện thoại khác"));
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error("Lỗi khi kiểm tra số điện thoại. Vui lòng thử lại."));
    }
  };
  useEffect(() => {
    if (monthTicketPrice && quantity) {
      const total = quantity * monthTicketPrice.price;
      form.setFieldsValue({ totalAmount: total.toLocaleString() + " VNĐ" });
    }
  }, [quantity, monthTicketPrice, form]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        message.error("Không có ID tuyến xe được cung cấp.");
        navigate(-1);
        return;
      }
      try {
        const busRouteResponse = await busRouteService.getById(id);
        console.log("busRouteResponse:", busRouteResponse);
        if (busRouteResponse?.data) {
          setBusRoute(busRouteResponse.data);
        } else {
          throw new Error("Không tìm thấy thông tin tuyến xe.");
        }

        const currentDate = dayjs().format("YYYY-MM-DD");
        console.log("currentDate:", currentDate);
        const priceResponse = await monthTicketPriceService.get();
        console.log("priceResponse:", priceResponse);

        if (!priceResponse.data || priceResponse.data.length === 0) {
          throw new Error("Danh sách giá vé tháng trống. Vui lòng kiểm tra dữ liệu hệ thống.");
        }

        const validPrice = priceResponse.data.find((price) =>
          price.busRouteId === id &&
          dayjs(currentDate).isBetween(price.timeStart, price.timeEnd, "day", "[]")
        );
        console.log("validPrice:", validPrice);

        if (validPrice) {
          setMonthTicketPrice(validPrice);
          console.log("monthTicketPrice set:", validPrice);
        } else {
          throw new Error(
            `Không tìm thấy giá vé tháng phù hợp cho tuyến xe ${id} vào ngày ${currentDate}.`
          );
        }
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu: " + (error as Error).message);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const onFinish = (values: any) => {
    console.log("onFinish - Raw Form values:", values);

    if (!monthTicketPrice) {
      message.error("Không có thông tin giá vé tháng để tính toán. Vui lòng thử lại.");
      return;
    }

    if (!values.startDate || !dayjs.isDayjs(values.startDate)) {
      message.error("Ngày bắt đầu không hợp lệ. Vui lòng chọn lại.");
      return;
    }

    const formattedValues = {
      ...values,
      startDate: values.startDate.format("YYYY-MM-DD"),
      totalAmount: values.quantity * monthTicketPrice.price,
    };

    console.log("Formatted Form values:", formattedValues);
    setFormValues(formattedValues);
    setIsModalVisible(true);
  };

  // Function to send confirmation email using EmailJS

const sendConfirmationEmail = async () => {
  if (!monthTicketData || !busRoute || !formValues) {
    console.error("Thiếu dữ liệu cần thiết để gửi email:", {
      monthTicketData: !!monthTicketData,
      busRoute: !!busRoute,
      formValues: !!formValues
    });
    message.error("Thiếu thông tin để gửi email xác nhận");
    return;
  }
  
  setSendingEmail(true);
  
  try {
    console.log("Chuẩn bị gửi email...");
    
    // Chi tiết dữ liệu được sử dụng cho email
    const templateParams = {
      to_email: formValues.email, // Email khách hàng
      to_name: formValues.fullName,
      route_name: busRoute.name,
      ticket_id: monthTicketData._id,
      register_date: monthTicketData.registerDate,
      expired_date: monthTicketData.expiredDate,
      quantity: formValues.quantity,
      total_amount:
        typeof formValues.totalAmount === "string"
          ? formValues.totalAmount
          : formValues.totalAmount.toLocaleString() + " VNĐ",
      payment_method: formValues.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản",
      company_name: "Hệ Thống Tuyến Bus Cần Thơ",
      customer_service: "1900xxxx",
      website: "https://company-xyz.com",
    };
    
    console.log("Chi tiết template params:", JSON.stringify(templateParams, null, 2));
    console.log("Thông tin EmailJS:", {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      userId: EMAILJS_USER_ID ? "Đã được thiết lập" : "Chưa thiết lập"
    });
    
    console.log("Đang gửi email đến:", formValues.email);
    
    // Triển khai logic thử lại cho việc gửi email
    const maxRetries = 2;
    let retryCount = 0;
    let success = false;
    
    while (retryCount <= maxRetries && !success) {
      try {
        console.log(`Đang thực hiện gửi email (lần thử ${retryCount + 1}/${maxRetries + 1})...`);
        
        // Thêm timeout cho việc gửi email để tránh treo
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout khi gửi email")), 10000)
        );
        
        const sendPromise = emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_USER_ID
        );
        
        // Race giữa gửi email và timeout
        const response = await Promise.race([sendPromise, timeoutPromise]);
        
        console.log("Phản hồi từ EmailJS:", response);
        success = true;
        message.success("Email xác nhận đã được gửi tới " + formValues.email);
      } catch (unknownError) {
        // Ép kiểu error để TypeScript không báo lỗi
        const emailError = unknownError as { 
          message?: string; 
          status?: number; 
          stack?: string;
        };
        
        console.error(`Lần thử ${retryCount + 1} gặp lỗi:`, emailError);
        
        if (emailError.message) {
          console.error("Chi tiết lỗi:", emailError.message);
        }
        
        if (typeof emailError.status !== 'undefined') {
          console.error(`Mã trạng thái HTTP: ${emailError.status}`);
        }
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Đang thử lại lần ${retryCount} sau 2 giây...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây trước khi thử lại
        } else {
          throw emailError; // Ném lỗi ra ngoài khi hết số lần thử
        }
      }
    }
  } catch (unknownError) {
    // Ép kiểu error cho TypeScript
    const error = unknownError as {
      message?: string;
      status?: number;
      stack?: string;
    };
    
    console.error("Lỗi khi gửi email sau khi đã thử lại:", error);
    
    if (error.stack) {
      console.error("Stack trace lỗi:", error.stack);
    }
    
    // Cung cấp thông báo lỗi chi tiết hơn cho người dùng
    if (error.message) {
      if (error.message.includes("network")) {
        message.warning("Không thể gửi email xác nhận do vấn đề kết nối mạng. Vui lòng kiểm tra kết nối và lưu lại thông tin vé của bạn.");
      } else if (error.message.includes("timeout")) {
        message.warning("Gửi email xác nhận bị timeout. Máy chủ không phản hồi. Vui lòng lưu lại thông tin vé của bạn.");
      } else {
        message.warning("Không thể gửi email xác nhận. Lỗi: " + error.message + ". Vui lòng lưu lại thông tin vé của bạn.");
      }
    } else if (error.status === 400 || error.status === 403) {
      message.warning("Không thể gửi email xác nhận do lỗi cấu hình EmailJS. Vui lòng liên hệ bộ phận kỹ thuật.");
      console.error("Cần kiểm tra lại thông tin xác thực EmailJS (ID dịch vụ, ID template, ID người dùng)");
    } else {
      message.warning("Không thể gửi email xác nhận do lỗi không xác định. Vui lòng lưu lại thông tin vé của bạn.");
    }
    
    // Đề xuất giải pháp thay thế cho người dùng
    Modal.info({
      title: 'Không thể gửi email xác nhận',
      content: (
        <div>
          <p>Hệ thống không thể gửi email xác nhận vé tháng. Vui lòng:</p>
          <ol>
            <li>Chụp ảnh màn hình thẻ thành viên tháng</li>
            <li>Ghi lại ID vé: {monthTicketData?._id || 'N/A'}</li>
            <li>Liên hệ bộ phận hỗ trợ qua số điện thoại 1900xxxx nếu cần thêm thông tin</li>
          </ol>
        </div>
      ),
    });
  } finally {
    setSendingEmail(false);
  }
};

  const handleConfirm = async () => {
    console.log("handleConfirm - formValues:", formValues);

    if (!monthTicketPrice || !monthTicketPrice._id) {
      message.error("Không có thông tin giá vé tháng hợp lệ. Vui lòng thử lại.");
      setIsModalVisible(false);
      return;
    }

    if (!formValues.startDate) {
      message.error("Ngày bắt đầu không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setIsModalVisible(false);
    setCurrentStep(1);

    try {
      const customerData: Partial<ICustomer> = {
        fullName: formValues.fullName,
        phone: formValues.phone,
        email: formValues.email,
      };
      const customerResponse = await customerService.create(customerData);
      const customerId = customerResponse.data._id;

      if (!customerId) {
        throw new Error("Không thể tạo khách hàng. Vui lòng thử lại.");
      }

      const registerDate = formValues.startDate;
      const expiredDate = dayjs(registerDate).add(1, "month").format("YYYY-MM-DD");

      const monthTicketData: Partial<IMonthTicket> = {
        customerId: customerId,
        registerDate: registerDate,
        expiredDate: expiredDate,
        expired: false,
        monthTicketPriceId: monthTicketPrice._id,
      };

      console.log("monthTicketData:", monthTicketData);
      const monthTicketResponse = await monthTicketService.create(monthTicketData);
      console.log("monthTicketResponse:", monthTicketResponse.data);

      // Lưu dữ liệu vé tháng để hiển thị thẻ
      setMonthTicketData(monthTicketResponse.data);

      message.success("Đăng ký vé tháng thành công! Vui lòng kiểm tra thẻ thành viên bên dưới.");
      
      // We'll call sendConfirmationEmail after the ticket card has been rendered
      // This happens in a useEffect below
    } catch (error) {
      message.error("Lỗi khi đăng ký vé tháng: " + (error as Error).message);
      setCurrentStep(0);
    }
  };

  // Send email after ticket card is rendered
  useEffect(() => {
    if (currentStep === 1 && monthTicketData && !sendingEmail) {
      // Small delay to ensure ticket card is fully rendered
      const timer = setTimeout(() => {
        sendConfirmationEmail();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, monthTicketData]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  const bankInfo = {
    bankId: "VIETCOMBANK",
    accountNumber: "1234567890",
    accountName: "Công ty vận tải XYZ",
  };

  const generateVietQRData = (values: any) => {
    const amount = monthTicketPrice ? monthTicketPrice.price * values.quantity : 0;
    const content = `Thanh toan ve thang - ${values.fullName}`;
    return `https://vietqr.net/portal?account=${bankInfo.accountNumber}&bank=${bankInfo.bankId}&amount=${amount}&content=${encodeURIComponent(content)}`;
  };

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }}>Đang tải...</p>;

  if (!monthTicketPrice) {
    return <p style={{ textAlign: "center", padding: "20px" }}>Không có giá vé tháng khả dụng để đăng ký.</p>;
  }

  return (
    <div className="register-ticket-container">
      <Card
        title={<div style={{ textAlign: "center", color: "#52c41a" }}>Đăng ký vé tháng Online - {busRoute?.name}</div>}
        bordered={false}
        style={{ maxWidth: 800, margin: "0 auto", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Điền thông tin" />
          <Step title="Xác nhận" />
        </Steps>

        {currentStep === 0 && (
          <Form
            form={form}
            name="monthly_ticket_form"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ province: "Cần Thơ", district: "Ninh Kiều", quantity: 1 }}
          >
            <h3 style={{ color: "#52c41a", marginBottom: 16 }}>Thông tin cá nhân</h3>
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
              >
                <Input placeholder="Nhập họ và tên" size="large" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" },
                  { validator: checkEmailDuplicate },
                ]}
              >
                <Input placeholder="Nhập email" size="large" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, pattern: /^[0-9]{10}$/, message: "Vui lòng nhập đúng 10 chữ số!" },
                  { validator: checkPhoneDuplicate },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  size="large"
                  maxLength={10}
                  onKeyPress={(e) => {
                    const charCode = e.charCode;
                    if (charCode < 48 || charCode > 57) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </div>

            <h3 style={{ color: "#52c41a", marginTop: 24, marginBottom: 16 }}>Thông tin vé</h3>
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
              <Form.Item name="quantity" label="Số lượng vé" rules={[{ required: true, message: "Vui lòng chọn số lượng!" }]}>
                <Select placeholder="Chọn số lượng" size="large">
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                  <Option value={3}>3</Option>
                </Select>
              </Form.Item>
              <Form.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}>
                <Select placeholder="Chọn tỉnh/thành phố" size="large" disabled>
                  <Option value="Cần Thơ">Cần Thơ</Option>
                </Select>
              </Form.Item>
              <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}>
                <Select placeholder="Chọn quận/huyện" size="large">
                  <Option value="Ninh Kiều">Ninh Kiều</Option>
                  <Option value="Bình Thủy">Bình Thủy</Option>
                  <Option value="Cái Răng">Cái Răng</Option>
                  <Option value="Ô Môn">Ô Môn</Option>
                  <Option value="Thốt Nốt">Thốt Nốt</Option>
                  <Option value="Phong Điền">Phong Điền</Option>
                  <Option value="Cờ Đỏ">Cờ Đỏ</Option>
                  <Option value="Thới Lai">Thới Lai</Option>
                  <Option value="Vĩnh Thạnh">Vĩnh Thạnh</Option>
                </Select>
              </Form.Item>
              <Form.Item name="startDate" label="Thời gian bắt đầu sử dụng" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}>
                <DatePicker style={{ width: "100%" }} size="large" placeholder="Chọn ngày" disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán!" }]}>
                <Select placeholder="Chọn phương thức" size="large">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="transfer">Chuyển khoản</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item name="totalAmount" label="Tổng tiền" style={{ marginTop: 16 }}>
              <Input disabled size="large" />
            </Form.Item>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button type="primary" htmlType="submit" size="large" style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16", marginRight: 8 }}>
                Thanh toán
              </Button>
              <Button onClick={handleCancel} size="large">Hủy</Button>
            </div>
          </Form>
        )}

        {currentStep === 1 && (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <h3 style={{ color: "#52c41a" }}>Xác nhận đăng ký</h3>
            <p>Đăng ký vé tháng của bạn đã được gửi thành công. Dưới đây là thẻ thành viên tháng của bạn:</p>
            
            {sendingEmail && 
              <div style={{ margin: "10px 0" }}>
                <p style={{ color: "#1890ff" }}>
                  <span style={{ display: "inline-block", width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #1890ff", borderTopColor: "transparent", animation: "spin 1s linear infinite", marginRight: "8px", verticalAlign: "middle" }}></span>
                  Đang gửi email xác nhận...
                </p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            }
            
            {!sendingEmail && formValues &&
              <p style={{ color: "#1890ff" }}>Thông tin vé đã được gửi tới địa chỉ email: <strong>{formValues.email}</strong></p>
            }

            {/* Thẻ thành viên */}
            {monthTicketData && (
              <div
                ref={ticketRef}
                style={{
                  width: "350px",
                  height: "200px",
                  backgroundColor: "#f0f2f5",
                  borderRadius: "10px",
                  padding: "20px",
                  margin: "20px auto",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  fontFamily: "Arial, sans-serif",
                  position: "relative",
                }}
              >
                <h4 style={{ margin: 0, color: "#1890ff" }}>Thẻ Thành Viên Tháng</h4>
                <p style={{ margin: "5px 0" }}><strong>Tuyến:</strong> {busRoute?.name}</p>
                <p style={{ margin: "5px 0" }}><strong>Họ và tên:</strong> {formValues?.fullName}</p>
                <p style={{ margin: "5px 0" }}><strong>Số điện thoại:</strong> {formValues?.phone}</p>
                <p style={{ margin: "5px 0" }}><strong>Ngày bắt đầu:</strong> {monthTicketData.registerDate}</p>
                <p style={{ margin: "5px 0" }}><strong>Ngày hết hạn:</strong> {monthTicketData.expiredDate}</p>
                <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                  <QRCodeSVG value={monthTicketData._id || "N/A"} size={60} />
                </div>
              </div>
            )}

            <Button type="primary" onClick={() => navigate(-1)} size="large" style={{ marginTop: 16 }}>
              Quay lại
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title="Xác nhận thông tin đăng ký vé tháng"
        open={isModalVisible}
        onOk={handleConfirm}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        {formValues && (
          <div>
            <p><strong>Họ và tên:</strong> {formValues.fullName}</p>
            <p><strong>Email:</strong> {formValues.email}</p>
            <p><strong>Số điện thoại:</strong> {formValues.phone}</p>
            <p><strong>Số lượng vé:</strong> {formValues.quantity}</p>
            <p><strong>Tỉnh/Thành phố:</strong> {formValues.province}</p>
            <p><strong>Quận/Huyện:</strong> {formValues.district}</p>
            <p><strong>Thời gian bắt đầu:</strong> {formValues.startDate}</p>
            <p><strong>Phương thức thanh toán:</strong> {formValues.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</p>
            <p><strong>Tổng tiền:</strong> {formValues.totalAmount.toLocaleString()} VNĐ</p>
            {formValues.paymentMethod === "transfer" && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <p><strong>Mã QR chuyển khoản (VietQR):</strong></p>
                <QRCodeSVG value={generateVietQRData(formValues)} size={150} />
                <p>Vui lòng quét mã QR để thực hiện chuyển khoản.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RegisterTicket;