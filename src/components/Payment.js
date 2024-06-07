//
export const CreateOrderPaypal = async (data) => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/paypalorder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const order = await response.json();
    console.log("CreateOrderPaypal:: order:: ", order);
    return order.id;
};

export const onApprovePaypal = async (orderID) => {
    const response = await fetch("http://127.0.0.1:8000/api/v1/capture", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({orderID: orderID}),
    });
    const details = await response.json();
    console.log("onAprovePaypal:: details:: ", details);

    return details;
};
