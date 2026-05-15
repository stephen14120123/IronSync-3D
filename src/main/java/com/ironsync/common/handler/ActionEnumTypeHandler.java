package com.ironsync.common.handler;

import com.ironsync.common.constant.ActionEnum;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ActionEnumTypeHandler extends BaseTypeHandler<ActionEnum> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, ActionEnum parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, parameter.getDisplayName());
    }

    @Override
    public ActionEnum getNullableResult(ResultSet rs, String columnName)
            throws SQLException {
        String val = rs.getString(columnName);
        return val == null ? null : ActionEnum.fromDisplayName(val);
    }

    @Override
    public ActionEnum getNullableResult(ResultSet rs, int columnIndex)
            throws SQLException {
        String val = rs.getString(columnIndex);
        return val == null ? null : ActionEnum.fromDisplayName(val);
    }

    @Override
    public ActionEnum getNullableResult(CallableStatement cs, int columnIndex)
            throws SQLException {
        String val = cs.getString(columnIndex);
        return val == null ? null : ActionEnum.fromDisplayName(val);
    }
}
