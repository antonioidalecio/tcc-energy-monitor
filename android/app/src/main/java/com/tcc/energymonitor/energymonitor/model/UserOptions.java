package com.tcc.energymonitor.energymonitor.model;

public class UserOptions {
  
  public Double tarifa;
  public Double metaMensal;
  public String unidade;
  
  public UserOptions() {
  }
  
  public UserOptions(Double tarifa, Double metaMensal, String unidade) {
    this.tarifa = tarifa;
    this.metaMensal = metaMensal;
    this.unidade = unidade;
  }
  
  @Override
  public String toString() {
    return "UserOptions{" +
      "tarifa=" + tarifa +
      ", metaMensal=" + metaMensal +
      ", unidade='" + unidade + '\'' +
      '}';
  }
}
