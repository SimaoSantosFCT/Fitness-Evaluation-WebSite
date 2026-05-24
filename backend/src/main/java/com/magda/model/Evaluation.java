package com.magda.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private LocalDate evaluationDate;
    private int age;
    private String genre;
    private String evaluationType; // "PRESENCIAL" | "ONLINE"

    // Presencial
    private double height;
    private double weight;
    private double fatMass;
    private double boneMass;
    private double water;
    private double muscleMass;
    private double visceralFat;
    private double basalMetabolism;
    private double metabolicAge;
    private int physicalLevel;
    private double imc;

    // Online — medidas fita métrica
    private double waist;
    private double neck;
    private double hip;
    private double heightCm;

    // Online — perímetros opcionais
    private double chestPerimeter;
    private double armPerimeter;
    private double thighPerimeter;

    public Evaluation() {}

    public Long getId()                         { return id; }
    public String getClientName()               { return clientName; }
    public void setClientName(String v)         { this.clientName = v; }
    public LocalDate getEvaluationDate()        { return evaluationDate; }
    public void setEvaluationDate(LocalDate v)  { this.evaluationDate = v; }
    public int getAge()                         { return age; }
    public void setAge(int v)                   { this.age = v; }
    public String getGenre()                    { return genre; }
    public void setGenre(String v)              { this.genre = v; }
    public String getEvaluationType()           { return evaluationType; }
    public void setEvaluationType(String v)     { this.evaluationType = v; }
    public double getHeight()                   { return height; }
    public void setHeight(double v)             { this.height = v; }
    public double getWeight()                   { return weight; }
    public void setWeight(double v)             { this.weight = v; }
    public double getFatMass()                  { return fatMass; }
    public void setFatMass(double v)            { this.fatMass = v; }
    public double getBoneMass()                 { return boneMass; }
    public void setBoneMass(double v)           { this.boneMass = v; }
    public double getWater()                    { return water; }
    public void setWater(double v)              { this.water = v; }
    public double getMuscleMass()               { return muscleMass; }
    public void setMuscleMass(double v)         { this.muscleMass = v; }
    public double getVisceralFat()              { return visceralFat; }
    public void setVisceralFat(double v)        { this.visceralFat = v; }
    public double getBasalMetabolism()          { return basalMetabolism; }
    public void setBasalMetabolism(double v)    { this.basalMetabolism = v; }
    public double getMetabolicAge()             { return metabolicAge; }
    public void setMetabolicAge(double v)       { this.metabolicAge = v; }
    public int getPhysicalLevel()               { return physicalLevel; }
    public void setPhysicalLevel(int v)         { this.physicalLevel = v; }
    public double getImc()                      { return imc; }
    public void setImc(double v)                { this.imc = v; }
    public double getWaist()                    { return waist; }
    public void setWaist(double v)              { this.waist = v; }
    public double getNeck()                     { return neck; }
    public void setNeck(double v)               { this.neck = v; }
    public double getHip()                      { return hip; }
    public void setHip(double v)                { this.hip = v; }
    public double getHeightCm()                 { return heightCm; }
    public void setHeightCm(double v)           { this.heightCm = v; }
    public double getChestPerimeter()           { return chestPerimeter; }
    public void setChestPerimeter(double v)     { this.chestPerimeter = v; }
    public double getArmPerimeter()             { return armPerimeter; }
    public void setArmPerimeter(double v)       { this.armPerimeter = v; }
    public double getThighPerimeter()           { return thighPerimeter; }
    public void setThighPerimeter(double v)     { this.thighPerimeter = v; }
}