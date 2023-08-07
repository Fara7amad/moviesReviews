const validateInputs= (email, username , password)=>{
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/;
      const nameRegex = /^([a-zA-Z]+\s)*[a-zA-Z]/;
      const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
     
      //signup validation
      if(email&&username&&password){
      const validEmail=emailRegex.test(email);
      const validName=nameRegex.test(username);
      const validPass=passRegex.test(password);
      if(validEmail&&validName&&validPass) return true;
      return false;
    }
    
    else if( email&&password)   //login validation
    {
      const validEmail=emailRegex.test(email); 
      const validPass=passRegex.test(password);
      if(validEmail&&validPass) return true;
      return false;
    }
    
    }

    module.exports=validateInputs;