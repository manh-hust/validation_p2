function Validator(formSelector) {
    var _this = this;
    // Tạo 1 đối tượng với các phương thức là các hàm kiểm tra 
    // điều kiện (isReqiued, isEmail)
    var formRules = {};
    // Lấy ra form với tham số là id
    var formElement = document.querySelector(formSelector.form);
    // Khởi tạo 1 đối tượng với các phương thức kiểm tra điều kiện
    // các phương thức nhận vào các giá trị được nhập trong thẻ input
    // trả về undefined nếu xác nhận thỏa mãn
    // trả về errorMessage nếu phát hiện không thỏa mãn
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này !'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Email không hợp lệ !'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự !`
            }
        },

    };
    // Lấy thẻ form to nhất chứa input, từ đó chọc vào thẻ form-message
    // để hiển thị thông báo lỗi
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // if (formElement) {
    // Tìm các elenment có attribute là rules gán cho mảng inputs
    // trong rules có chứa các điều kiện cần kiểm tra( isRequied , isEmail, ...)
    var inputs = formElement.querySelectorAll('[name][rules]')
    // Lặp qua từng element của mảng
    // ở đây có 3 element là : Tên đăng nhập, Email, Password.
    for (var input of inputs) {

        // Lấy value trong attribute rồi cắt ra thành mảng nếu 
        // có kí tự / vì mỗi 1 điều kiện được ngăn cách bởi dấu /
        var rules = input.getAttribute('rules').split('|');
        input.onblur = handleValidate;
        input.oninput = handleClearError;
        // Lặp từng rule trong mảng rules với mục đích lấy ra được
        // hàm có tên là rule kiểm tra lỗi và lưu vào trong formRules
        for (var rule of rules) {            
            var ruleInfo;
            // Tìm kiến trong rule có dấu ':' không
            var isRuleHasValue = rule.includes(':');

            if (isRuleHasValue) {
                // Trường hợp đặc biệt có dấu ':' phải cắt thành mảng
                // nhỏ nhơ lưu trong ruleInfo
                ruleInfo = rule.split(':')
                // phần tử đầu tiên mảng là 'min' - tên hàm kiểm tra điều kiện
                rule = ruleInfo[0];
            }
            // Là hàm điểm tra điều kiện với tên được lấy
            // chính từ rule
            var ruleFunc = validatorRules[rule];

            if (isRuleHasValue) {
                ruleFunc = ruleFunc(ruleInfo[1]);
            }
            // Nếu formRules là 1 mảng thì lần lượt thêm các
            // hàm cần kiểm tra trong 1 ô input
            if (Array.isArray(formRules[input.name])) {
                formRules[input.name].push(ruleFunc);
            }
            // Nếu không phải mảng thì sẽ gán cho phần tử đầu tiên
            else {
                formRules[input.name] = [ruleFunc];
            }
        }

        // Mỗi lần blur hay input vào thì nó lại
        // chạy vòng lặp lại từ đầu 

    }

    // Sự kiện blur ra ngoài 
    function handleValidate(e) {
        // Khi blur khỏi 1 element thì các hàm điều kiện
        // được lấy ra gán cho rules
        var rules = formRules[e.target.name];
        console.log(rules)
        var errorMessage;
        // Lặp qua các hàm với đối số là value người dùng nhập
        // kiểm tra có thỏa mãn điều kiện không
        // nếu gặp lỗi lập tức dừng lại và lỗi được gán cho errormessage
        for (let i = 0; i < rules.length; i++) {
            var errorMessage = rules[i](e.target.value);
            if (errorMessage) {
                break;
            }
        }

        //  Nếu có lỗi thì tìm thẻ span để hiển thị ra lỗi
        //  đồng thời hiển thị cảnh báo màu đỏ
        if (errorMessage) {
            var formGroup = getParent(e.target, formSelector.formGroup);
            if (formGroup) {
                formGroup.classList.add(formSelector.invalid);
                var formMessage = formGroup.querySelector(formSelector.formMes);
                if (formMessage) {
                    formMessage.innerText = errorMessage;
                }
            }
        }
        // Hàm handle trả về false nếu có lỗi
        // Trả về true nếu không có lỗi
        return !errorMessage;
    }
    // Sự kiện nhập vào để clear lỗi
    // khi đang gặp lỗi mà nhập vào thì
    // ngay lập tức gỡ lỗi
    function handleClearError(e) {
        var formGroup = getParent(e.target, formSelector.formGroup);
        if (formGroup.classList.contains(formSelector.invalid)) {
            formGroup.classList.remove(formSelector.invalid)

            var formMessage = formGroup.querySelector(formSelector.formMes);
            if (formMessage) {
                formMessage.innerText = '';
            }
        }
    }
    // }
    // Xử lí hành vi submit Form
    formElement.onsubmit = function (e) {
        e.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        // Kiểm tra khi blur có lỗi nào không
        // Nếu có thì phải nhập đúng mới submit được
        for (var input of inputs) {
            if (!handleValidate({
                    target: input
                })) {
                isValid = false
            }
        }
        // Nếu không thì thực hiện function submit
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]:not(disable)')
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    values[input.name] = input.value;
                    return values;
                }, {})

                // Gọi lại hàm Submit và các giá trị của form
                _this.onSubmit(formValues);
            } else {
                formElement.onsubmit();
            }
        }
    }
}


// this ?