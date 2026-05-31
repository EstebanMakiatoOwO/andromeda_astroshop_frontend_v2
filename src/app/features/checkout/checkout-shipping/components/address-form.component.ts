import { Component, input, output, signal } from '@angular/core';

export interface AddressFormValue {
  name: string;
  email: string;
  phone: string;
  street: string;
  numExt: string;
  numInt: string;
  colonia: string;
  city: string;
  state: string;
  cp: string;
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent {
  submitted = input(false);
  formChange = output<AddressFormValue>();

  protected readonly v = {
    name:    signal(''),
    email:   signal(''),
    phone:   signal(''),
    street:  signal(''),
    numExt:  signal(''),
    numInt:  signal(''),
    colonia: signal(''),
    city:    signal(''),
    state:   signal(''),
    cp:      signal(''),
  };

  protected readonly states = [
    'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
    'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Guanajuato',
    'Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit',
    'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
    'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
  ];

  protected set(key: keyof typeof this.v, val: string): void {
    this.v[key].set(val);
    this.emit();
  }

  protected isRequired(key: keyof typeof this.v): boolean {
    return this.submitted() && !this.v[key]();
  }

  private emit(): void {
    this.formChange.emit({
      name:    this.v.name(),
      email:   this.v.email(),
      phone:   this.v.phone(),
      street:  this.v.street(),
      numExt:  this.v.numExt(),
      numInt:  this.v.numInt(),
      colonia: this.v.colonia(),
      city:    this.v.city(),
      state:   this.v.state(),
      cp:      this.v.cp(),
    });
  }

  isValid(): boolean {
    const required: (keyof typeof this.v)[] = ['name','email','phone','street','numExt','colonia','city','state','cp'];
    return required.every(k => !!this.v[k]());
  }

  getValue(): AddressFormValue {
    return {
      name:    this.v.name(),
      email:   this.v.email(),
      phone:   this.v.phone(),
      street:  this.v.street(),
      numExt:  this.v.numExt(),
      numInt:  this.v.numInt(),
      colonia: this.v.colonia(),
      city:    this.v.city(),
      state:   this.v.state(),
      cp:      this.v.cp(),
    };
  }
}
