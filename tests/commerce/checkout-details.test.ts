import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCheckoutDetails } from '../../src/lib/checkout-details';
const input = {
  paymentMethod:'cod', contact:{name:'Client Test',email:'client@example.test',phone:'0712345678'},
  shipping:{line1:'Strada Test 10',city:'Cluj-Napoca',state:'Cluj',postal_code:'400001',country:'RO'},
  billing:{type:'company',companyName:'Firma Test SRL',taxId:'ro12345678',registrationNumber:'',address:'Strada Sediu 1, Cluj'},
};
test('normalizes company invoicing and rejects invalid payment, contact and shipping data',()=>{
 assert.equal(parseCheckoutDetails(input).billing.taxId,'RO12345678');
 for (const paymentMethod of ['cash','bank',null,'']) assert.throws(()=>parseCheckoutDetails({...input,paymentMethod}));
 assert.throws(()=>parseCheckoutDetails({...input,billing:{...input.billing,taxId:'ABC'}}));
 assert.throws(()=>parseCheckoutDetails({...input,billing:{...input.billing,address:''}}));
 assert.throws(()=>parseCheckoutDetails({...input,contact:{...input.contact,email:'invalid'}}));
 assert.throws(()=>parseCheckoutDetails({...input,shipping:{...input.shipping,country:'DE'}}));
 assert.throws(()=>parseCheckoutDetails({...input,shipping:{...input.shipping,postal_code:'123'}}));
 const personal=parseCheckoutDetails({...input,billing:{...input.billing,type:'personal'}});
 assert.equal(personal.billing.companyName,''); assert.equal(personal.billing.taxId,'');
 assert.match(personal.billing.address,/Strada Test 10/);
});
