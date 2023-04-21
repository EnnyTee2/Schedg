// Handle and resolve async errors on controllers
const catchAsyncErrors = (controller) => {
    return (req, res, next) => {
      Promise.resolve(controller(req, res, next))
        .catch((error) => {
          next(error);
        });
    };
  };
  
  export default catchAsyncErrors;
  