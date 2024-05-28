class ApiResponse{
    constructor(
        data,
        message="success",
        statusCode,
    ){
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.sucess = statusCode <400;
    }
}